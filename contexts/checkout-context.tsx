'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, useSession } from 'next-auth/react';
import type {
	BillingAddress,
	CartItem,
	CheckoutCustomer,
	CheckoutFieldRequirement,
	CheckoutResponse,
	CheckoutSetting,
	CheckoutStartResponse,
	CustomerProviderCatalogItem,
	MarketingConsentInput,
	MarketingOptInDisplay,
	StartCheckout,
	SubmitCheckout,
} from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useSettings } from '@/contexts/settings-context';
import { usePaymentProviders } from '@/hooks/use-payment-providers';
import { saveOutcome } from '@/lib/checkout-outcome';

/**
 * The docket's state: who's sitting (contact details), then how they settle up. Notes for the
 * barber are answered on /book, so there is no questions step here.
 */
export type CheckoutStep = 'customer' | 'payment-select' | 'payment';

/** A payment method's provider name. */
type ProviderName = CustomerProviderCatalogItem['name'];
export type ConsentChannel = keyof MarketingConsentInput;

/** What the store asks for at checkout, with safe defaults when settings are missing. */
export interface CheckoutFields {
	firstNameRequired: boolean;
	phone: CheckoutFieldRequirement;
	billingAddress: CheckoutFieldRequirement;
	companyName: CheckoutFieldRequirement;
	taxId: CheckoutFieldRequirement;
	/** Marketing channels offered at checkout, in display order. */
	consentChannels: ConsentChannel[];
}

export interface BillingDraft {
	companyName: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
	/** ISO 3166-1 alpha-2. */
	country: string;
	taxRegistrationId: string;
}

export type ConsentDraft = Record<ConsentChannel, boolean>;

const EMPTY_BILLING: BillingDraft = {
	companyName: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
	country: 'DE',
	taxRegistrationId: '',
};
const EMPTY_CONSENT: ConsentDraft = { email: false, sms: false, whatsapp: false };

// The backend can override the requested provider with the "no payment required" fallback when nothing
// is collectible. Compare against the known name (the SDK union is the source of truth for the rest).
function isNoPaymentRequired(provider: CheckoutStartResponse['provider']): boolean {
	return provider === 'no_payment_required';
}

/** Checkout conflicts the API names with a `code`; the wording below is ours, the code decides. */
const CODE_MESSAGE: Record<string, string> = {
	CART_EXPIRED: 'Your hold ran out and someone else took that time. Pick a new time and we’ll hold it for you.',
	PAYMENT_NOT_AUTHORIZED: 'Your card wasn’t authorised, so nothing was booked or charged. Try again, or use another card.',
	CHECKOUT_IN_PROGRESS: 'We’re still processing your booking. Give it a moment and try again.',
};
/** CHECKOUT_IN_PROGRESS: another request for this cart is running (a double click, a second tab). Wait and retry. */
const IN_PROGRESS_RETRIES = 4;
const IN_PROGRESS_WAIT_MS = 1500;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

class CheckoutError extends Error {
	constructor(
		message: string,
		readonly code?: string,
		readonly orderId?: string,
	) {
		super(message);
	}
}

function requirement(value: CheckoutFieldRequirement | null | undefined): CheckoutFieldRequirement {
	return value === 'required' || value === 'optional' ? value : 'hidden';
}

function shown(value: MarketingOptInDisplay | null | undefined): boolean {
	return value === 'checkout_only' || value === 'checkout_and_account';
}

export function checkoutFieldsOf(cs: CheckoutSetting | null | undefined): CheckoutFields {
	const consentChannels: ConsentChannel[] = [];
	if (shown(cs?.emailMarketingOptIn)) consentChannels.push('email');
	if (shown(cs?.smsMarketingOptIn)) consentChannels.push('sms');
	if (shown(cs?.whatsappMarketingOptIn)) consentChannels.push('whatsapp');
	return {
		firstNameRequired: cs?.customerFirstNameRequired ?? false,
		phone: requirement(cs?.customerPhoneRequirement ?? 'optional'),
		billingAddress: requirement(cs?.customerBillingAddressRequirement),
		companyName: requirement(cs?.customerCompanyNameRequirement),
		taxId: requirement(cs?.customerCompanyVatNumberRequirement),
		consentChannels,
	};
}

/** Backend field paths (e.g. "billingAddress.city") → message. */
export type FieldErrors = Record<string, string>;

interface CheckoutContextValue {
	step: CheckoutStep;
	error: string | null;
	fieldErrors: FieldErrors;
	submitting: boolean;
	checkoutComplete: boolean;
	/** The held time was taken (CART_EXPIRED): the customer has to pick a new one. */
	holdLost: boolean;

	fields: CheckoutFields;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	billing: BillingDraft;
	/** Optional billing address opened by the patient. Always true when required. */
	billingOpen: boolean;
	consent: ConsentDraft;
	/** Signed-in patient (details prefilled, email locked). */
	signedIn: boolean;
	customerId: string | null;
	setEmail: (v: string) => void;
	setFirstName: (v: string) => void;
	setLastName: (v: string) => void;
	setPhone: (v: string) => void;
	updateBilling: (patch: Partial<BillingDraft>) => void;
	setBillingOpen: (v: boolean) => void;
	setConsent: (channel: ConsentChannel, value: boolean) => void;

	providers: CustomerProviderCatalogItem[];
	selectedProvider: ProviderName | null;
	paymentData: CheckoutStartResponse | null;

	items: CartItem[];
	isExpired: boolean;
	timeRemaining: number | null;

	setStep: (step: CheckoutStep) => void;
	setError: (error: string | null) => void;
	handleSaveCustomer: (e: React.FormEvent) => Promise<void>;
	handleStartCheckout: (providerName: ProviderName) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<void>;
	extendCart: () => Promise<void>;
	/** Drops the cart and goes back to /book to pick a new time. */
	startOver: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

function trimmed(v: string): string | undefined {
	const t = v.trim();
	return t ? t : undefined;
}

interface ReadError {
	message: string;
	fields: FieldErrors;
	code?: string;
	orderId?: string;
}

async function readError(res: Response, fallback: string): Promise<ReadError> {
	try {
		const data = (await res.json()) as { error?: string; errors?: FieldErrors; code?: string; orderId?: string };
		const message = (data.code && CODE_MESSAGE[data.code]) || data.error || fallback;
		return { message, fields: data.errors ?? {}, code: data.code, orderId: data.orderId };
	} catch {
		return { message: fallback, fields: {} };
	}
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { settings } = useSettings();
	const { cart, cartId, isLoaded, timeRemaining, extendCart, clearCart } = useCart();
	const fields = useMemo(() => checkoutFieldsOf(settings?.checkoutSettings), [settings?.checkoutSettings]);

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);
	const [holdLost, setHoldLost] = useState(false);

	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [billing, setBilling] = useState<BillingDraft>(EMPTY_BILLING);
	const [billingOpenState, setBillingOpen] = useState(false);
	const [consent, setConsentState] = useState<ConsentDraft>(EMPTY_CONSENT);
	/** Id returned by save-customer (trusted only); used when starting checkout. */
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [prefilled, setPrefilled] = useState(false);

	const sessionCustomerId = session?.customer?.id ?? null;

	// Prefill from the session once.
	useEffect(() => {
		if (session?.customer && !prefilled) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmail(session.customer.email);
			if (session.customer.firstName) setFirstName(session.customer.firstName);
			if (session.customer.lastName) setLastName(session.customer.lastName);
			setPrefilled(true);
		}
	}, [session, prefilled]);

	const providers = usePaymentProviders(cartId);
	const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);
	// The method being paid with, read by submit (state would be stale inside the same call).
	const providerRef = useRef<ProviderName | null>(null);

	// No cart at all → back to /book. Only once CartProvider has read the
	// stored cart id from localStorage (before that cartId is always null, so a
	// hard reload of /checkout would otherwise bounce away).
	useEffect(() => {
		if (isLoaded && !cartId && !checkoutComplete) {
			router.replace('/book');
		}
	}, [isLoaded, cartId, checkoutComplete, router]);

	const updateBilling = useCallback((patch: Partial<BillingDraft>) => setBilling((b) => ({ ...b, ...patch })), []);
	const setConsent = useCallback(
		(channel: ConsentChannel, value: boolean) => setConsentState((c) => ({ ...c, [channel]: value })),
		[],
	);
	const billingOpen = fields.billingAddress === 'required' || (fields.billingAddress === 'optional' && billingOpenState);

	const cartHeaders = useCallback(
		(): Record<string, string> =>
			cartId ? { 'X-Cart-Id': cartId, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
		[cartId],
	);

	/** The contact fields the store asks for, shared by save-customer and checkout start. */
	const contactFields = useCallback(() => {
		let billingAddress: BillingAddress | undefined;
		if (billingOpen) {
			billingAddress = {
				firstName: trimmed(firstName),
				lastName: trimmed(lastName),
				email: trimmed(email),
				phone: trimmed(phone),
				companyName: fields.companyName !== 'hidden' ? trimmed(billing.companyName) : undefined,
				taxRegistrationId: fields.taxId !== 'hidden' ? trimmed(billing.taxRegistrationId) : undefined,
				addressLine1: trimmed(billing.addressLine1),
				addressLine2: trimmed(billing.addressLine2),
				city: trimmed(billing.city),
				state: trimmed(billing.state),
				postalCode: trimmed(billing.postalCode),
				country: billing.country || undefined,
			};
		}
		let marketingConsent: MarketingConsentInput | undefined;
		if (fields.consentChannels.length > 0) {
			marketingConsent = {};
			for (const ch of fields.consentChannels) marketingConsent[ch] = consent[ch];
		}
		return {
			firstName: trimmed(firstName),
			lastName: trimmed(lastName),
			phone: fields.phone !== 'hidden' ? trimmed(phone) : undefined,
			billingAddress,
			marketingConsent,
		};
	}, [billing, billingOpen, consent, email, fields, firstName, lastName, phone]);

	// 01 — Save contact details.
	const handleSaveCustomer = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setFieldErrors({});
			setSubmitting(true);

			try {
				// A signed-in patient checks out as themselves; everyone else by email.
				const customer: CheckoutCustomer['customer'] = sessionCustomerId
					? { kind: 'existing', customerId: sessionCustomerId, ...contactFields() }
					: { kind: 'new', email: email.trim(), ...contactFields() };

				const res = await fetch('/api/checkout/save-customer', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({ customer }),
				});

				if (!res.ok) {
					const { message, fields: errs } = await readError(res, 'We couldn’t save your details. Please check them and try again.');
					setFieldErrors(errs);
					throw new Error(message);
				}

				const saved = (await res.json().catch(() => ({}))) as { customerId?: string };
				// Only trusted ids come back; an email already on file stays attached to the cart server-side.
				setCustomerId(saved.customerId ?? sessionCustomerId);
				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
			} finally {
				setSubmitting(false);
			}
		},
		[sessionCustomerId, contactFields, email, cartHeaders],
	);

	/** POST a checkout step; CHECKOUT_IN_PROGRESS waits and retries, other failures throw a CheckoutError. */
	const post = useCallback(
		async <T,>(url: string, body: unknown, fallback: string): Promise<T> => {
			for (let attempt = 0; ; attempt++) {
				const res = await fetch(url, { method: 'POST', headers: cartHeaders(), body: JSON.stringify(body) });
				if (res.ok) return (await res.json()) as T;
				const e = await readError(res, fallback);
				if (e.code === 'CHECKOUT_IN_PROGRESS' && attempt < IN_PROGRESS_RETRIES) {
					await wait(IN_PROGRESS_WAIT_MS);
					continue;
				}
				throw new CheckoutError(e.message, e.code, e.orderId);
			}
		},
		[cartHeaders],
	);

	const fail = useCallback((err: unknown) => {
		if (err instanceof CheckoutError && err.code === 'CART_EXPIRED') setHoldLost(true);
		setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
		setSubmitting(false);
	}, []);

	/** The order exists: sign the customer in, keep the outcome for the thank-you page, leave checkout. */
	const finish = useCallback(
		async (data: CheckoutResponse) => {
			if (data.auth?.accessToken) {
				await nextAuthSignIn('checkout-token', {
					accessToken: data.auth.accessToken,
					refreshToken: data.auth.refreshToken,
					redirect: false,
				});
			}
			saveOutcome(data, providerRef.current);
			setCheckoutComplete(true);
			clearCart();
			router.push(`/thank-you?orderId=${data.order?.id ?? ''}`);
		},
		[clearCart, router],
	);

	const submitOrder = useCallback(
		async (stripePaymentIntentId?: string) => {
			const submitPayload: SubmitCheckout = {};
			if (stripePaymentIntentId) submitPayload.stripePaymentIntentId = stripePaymentIntentId;
			const data = await post<CheckoutResponse>('/api/checkout/submit', submitPayload, 'We couldn’t place your booking. Please try again.');
			await finish(data);
		},
		[post, finish],
	);

	// Final — submit the order (after the card is confirmed, or straight after start for other methods).
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setError(null);
			setSubmitting(true);
			try {
				await submitOrder(stripePaymentIntentId);
			} catch (err: unknown) {
				fail(err);
			}
		},
		[submitOrder, fail],
	);

	// 02 — Start checkout with the chosen method, then route on how that method collects payment.
	const handleStartCheckout = useCallback(
		async (providerName: ProviderName) => {
			setError(null);
			setSubmitting(true);
			setSelectedProvider(providerName);
			providerRef.current = providerName;

			try {
				// Re-send the contact fields: start re-validates the store's requirements. Without a
				// trusted id (an email already on file) they go by email, so billing / consent still
				// reach the booking.
				const startPayload: StartCheckout = {
					provider: providerName,
					customer: customerId
						? { kind: 'existing', customerId, ...contactFields() }
						: { kind: 'new', email: email.trim(), ...contactFields() },
				};

				let data: CheckoutStartResponse;
				try {
					data = await post<CheckoutStartResponse>('/api/checkout/start', startPayload, 'We couldn’t start payment. Please try again.');
				} catch (err) {
					if (!(err instanceof CheckoutError) || err.code !== 'CART_ALREADY_CHECKED_OUT') throw err;
					// Already an order (a second tab, a retry after a lost response): submit returns that order.
					try {
						await submitOrder();
					} catch {
						if (!err.orderId) throw err;
						setCheckoutComplete(true);
						clearCart();
						router.push(`/thank-you?orderId=${err.orderId}`);
					}
					return;
				}
				setPaymentData(data);

				// `checkoutMode` says how the method collects: `internal` mounts the card form, `redirect` leaves
				// for the provider, `manual` (cash, bank transfer, invoice) and `none` place the order now. The
				// backend may also swap in "no payment required" when nothing is collectible.
				const mode = providers.find((p) => p.name === providerName)?.checkoutMode;
				if (isNoPaymentRequired(data.provider) || mode === 'manual' || mode === 'none') {
					await submitOrder();
				} else if (data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else if (data.clientSecret) {
					setStep('payment');
					setSubmitting(false);
				} else if (!mode) {
					// A method this site doesn't know and nothing to mount: place the order like a manual one.
					await submitOrder();
				} else {
					throw new CheckoutError('Card payment couldn’t start. Please try again or choose another way to pay.');
				}
			} catch (err: unknown) {
				fail(err);
			}
		},
		[customerId, contactFields, email, post, providers, submitOrder, fail, clearCart, router],
	);

	const startOver = useCallback(() => {
		setCheckoutComplete(true);
		clearCart();
		router.push('/book');
	}, [clearCart, router]);

	const items = useMemo(() => cart?.items ?? [], [cart?.items]);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	const value = useMemo<CheckoutContextValue>(
		() => ({
			step,
			error,
			fieldErrors,
			submitting,
			checkoutComplete,
			holdLost,
			fields,
			email,
			firstName,
			lastName,
			phone,
			billing,
			billingOpen,
			consent,
			signedIn: Boolean(sessionCustomerId),
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			setPhone,
			updateBilling,
			setBillingOpen,
			setConsent,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			setStep,
			setError,
			handleSaveCustomer,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
			startOver,
		}),
		[
			step,
			error,
			fieldErrors,
			submitting,
			checkoutComplete,
			holdLost,
			fields,
			email,
			firstName,
			lastName,
			phone,
			billing,
			billingOpen,
			consent,
			sessionCustomerId,
			customerId,
			updateBilling,
			setConsent,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			handleSaveCustomer,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
			startOver,
		],
	);

	return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}
