'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import type {
	CheckoutQuestion,
	CheckoutStartResponse,
	CurrentAvailabilitySlot,
	CustomerProviderCatalogItem,
} from '@opencals/storefront-sdk';
import type { BookingStep } from '@/lib/booking-constants';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useProductData } from '@/hooks/use-product-data';
import { useAvailability } from '@/hooks/use-availability';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';

export function useBookingFlow(slug: string) {
	const router = useRouter();
	const { data: session } = useSession();
	const { cartId, setCart, clearCart, timeRemaining } = useCart();
	const { selectedLocationId: globalLocationId } = useLocation();
	const { formatCustom, formatTimeRange, timezone } = useDateFormatter();

	const productData = useProductData(slug);
	const { product, activeVariant, variants, hasVariants, selectedVariantId, setSelectedVariantId } = productData;

	// Selection
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [confirmedStaffId, setConfirmedStaffId] = useState<string | null>(null);
	const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
	const [attendees, setAttendees] = useState(1);

	// Customer
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const prefilledRef = useRef(false);

	// Questions
	const [questions, setQuestions] = useState<CheckoutQuestion[]>([]);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Payment
	const [providers, setProviders] = useState<CustomerProviderCatalogItem[]>([]);
	const [provider, setProvider] = useState<string | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// Flow
	const [step, setStep] = useState<BookingStep>('when');
	const [committed, setCommitted] = useState(false);
	const [committedCartId, setCommittedCartId] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

	const finalStaffId = selectedStaffId ?? confirmedStaffId;
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	// Pre-fill customer from session
	useEffect(() => {
		if (session?.customer && !prefilledRef.current) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmail(session.customer.email);
			if (session.customer.firstName) setFirstName(session.customer.firstName);
			if (session.customer.lastName) setLastName(session.customer.lastName);
			prefilledRef.current = true;
		}
	}, [session]);

	// Fetch payment providers once
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/api/payment/providers');
				if (res.ok) {
					const data = await res.json();
					setProviders(Array.isArray(data) ? data : []);
				}
			} catch {
				// non-fatal
			}
		})();
	}, []);

	// Fetch questions once product known
	useEffect(() => {
		if (!slug) return;
		(async () => {
			try {
				const res = await fetch(`/api/products/${slug}/questions?language=en`);
				if (res.ok) {
					const data = await res.json();
					setQuestions(Array.isArray(data) ? data : []);
				}
			} catch {
				// non-fatal
			}
		})();
	}, [slug]);

	const staffForLocation = useMemo(() => {
		return (activeVariant?.staffMembers ?? []).filter((staff) => {
			if (!selectedLocationId) return true;
			const staffLocations = staff.locations;
			if (!staffLocations) return true;
			return staffLocations.some((l) => l.id === selectedLocationId);
		});
	}, [activeVariant?.staffMembers, selectedLocationId]);

	const availability = useAvailability({
		activeVariant,
		timezone,
		staffMemberId: selectedStaffId,
		locationId: selectedLocationId,
	});

	const slotStaff = useMemo(() => {
		if (!availability.selectedSlot) return [] as typeof staffForLocation;
		return staffForLocation.filter((s) => availability.selectedSlot!.staffMemberIds?.includes(s.id));
	}, [availability.selectedSlot, staffForLocation]);

	const whoSkipped = selectedStaffId !== null || slotStaff.length <= 1;

	const bookedDurationUnits = useMemo(() => {
		const baseDuration = activeVariant?.duration ?? product?.duration;
		if (!baseDuration || !availability.selectedSlot) return 1;
		const slot = availability.selectedSlot;
		const from = new Date(`${slot.fromDate}T${slot.fromTime}Z`);
		const to = new Date(`${slot.toDate}T${slot.toTime}Z`);
		const durationSeconds = (to.getTime() - from.getTime()) / 1000;
		return Math.max(1, Math.ceil(durationSeconds / baseDuration));
	}, [activeVariant?.duration, product?.duration, availability.selectedSlot]);

	const addOns = useBookingAddOns({
		activeVariant,
		locationId: selectedLocationId,
		staffMemberId: finalStaffId,
		bookedDurationUnits,
	});

	const cartHeaders = useCallback(
		(id?: string | null): Record<string, string> => {
			const h: Record<string, string> = { 'Content-Type': 'application/json' };
			const useId = id ?? committedCartId ?? cartId;
			if (useId) h['X-Cart-Id'] = useId;
			return h;
		},
		[cartId, committedCartId],
	);

	// Reset on variant switch
	useEffect(() => {
		setSelectedStaffId(null);
		setConfirmedStaffId(null);
		availability.setSelectedDate(null);
		setCommitted(false);
		setCommittedCartId(null);
		setProvider(null);
		setPaymentData(null);
		setStep('when');
		addOns.resetSelection();
		setAnswers({});

		const variantLocations = activeVariant?.locations ?? [];
		const contextMatch = variantLocations.find((l) => l.id === globalLocationId);
		setSelectedLocationId(contextMatch?.id ?? variantLocations[0]?.id ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVariantId, globalLocationId]);

	const handleDateSelect = useCallback(
		(date: string | null) => {
			availability.setSelectedDate(date);
			addOns.resetSelection();
		},
		[availability, addOns],
	);

	const handlePreSelectStaff = useCallback(
		(staffId: string | null) => {
			setSelectedStaffId(staffId);
			setConfirmedStaffId(null);
			availability.resetSlot();
			addOns.resetSelection();
		},
		[availability, addOns],
	);

	const handleSlotSelect = useCallback(
		(slot: CurrentAvailabilitySlot) => {
			availability.selectSlot(slot);
			setConfirmedStaffId(null);
			addOns.resetSelection();
			const eligibleStaff = staffForLocation.filter((s) => slot.staffMemberIds?.includes(s.id));
			const skipsWho = selectedStaffId !== null || eligibleStaff.length <= 1;
			setStep(skipsWho ? 'extras' : 'who');
		},
		[availability, addOns, staffForLocation, selectedStaffId],
	);

	const handleStaffConfirm = useCallback((staffId: string | null) => {
		setConfirmedStaffId(staffId);
		setStep('extras');
	}, []);

	const handleContinueFromExtras = useCallback(() => {
		setStep(questions.length > 0 ? 'questions' : 'details');
	}, [questions.length]);

	const handleContinueFromQuestions = useCallback(() => {
		setStep('details');
	}, []);

	const customerPayload = useMemo(() => {
		if (customerId) {
			return { kind: 'existing' as const, customerId };
		}
		return {
			kind: 'new' as const,
			email,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
		};
	}, [customerId, email, firstName, lastName]);

	const handleSubmitDetails = useCallback(async () => {
		if (!activeVariant || !availability.selectedSlot) return;
		setSubmitting(true);
		setError(null);
		setFieldErrors({});

		try {
			const slot = availability.selectedSlot;
			const answerArray = Object.entries(answers)
				.filter(([, value]) => value != null && value !== '')
				.map(([questionId, value]) => {
					const q = questions.find((x) => x.id === questionId);
					const title = q?.translations?.[0]?.title ?? q?.internalName ?? '';
					return { questionId, question: title, answer: value };
				});

			const res = await fetch('/api/book', {
				method: 'POST',
				headers: cartHeaders(),
				body: JSON.stringify({
					slot: {
						productId: activeVariant.id,
						fromDate: slot.fromDate,
						fromTime: slot.fromTime,
						toDate: slot.toDate,
						toTime: slot.toTime,
						staffMemberId: finalStaffId ?? slot.staffMemberIds?.[0] ?? null,
						locationId: selectedLocationId ?? slot.locationIds?.[0] ?? null,
					},
					numberOfAttendees: attendees,
					addOns: Array.from(addOns.selectedAddOns.entries()).map(([addOnId, quantity]) => {
						const addOn = addOns.availableAddOns.find((a) => a.id === addOnId);
						return addOn?.durationMultiplied ? { addOnId } : { addOnId, quantity };
					}),
					customer: customerPayload,
					checkoutQuestionAnswers: answerArray,
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				if (data?.errors) setFieldErrors(data.errors);
				throw new Error(data?.error || 'Could not save your details');
			}

			const data = await res.json();
			if (data.cart) {
				setCart(data.cart);
				setCommittedCartId(data.cart.id ?? null);
			}
			setCommitted(true);
			setStep('payment');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Could not save your details');
		} finally {
			setSubmitting(false);
		}
	}, [
		activeVariant,
		availability.selectedSlot,
		attendees,
		cartHeaders,
		finalStaffId,
		selectedLocationId,
		addOns,
		answers,
		customerPayload,
		setCart,
	]);

	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setSubmitting(true);
			setError(null);
			try {
				const res = await fetch('/api/checkout/submit', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({
						appointmentsSettings: { markAsScheduled: true },
						...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
					}),
				});
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(data?.error || 'Checkout failed');
				}
				const data = await res.json();
				if (data.auth?.accessToken) {
					await signIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						customerId: data.customer?.id ?? '',
						customerEmail: data.customer?.email ?? email,
						customerFirstName: data.customer?.firstName ?? firstName,
						customerLastName: data.customer?.lastName ?? lastName,
						redirect: false,
					});
				}
				clearCart();
				router.push(`/thank-you?orderId=${data.order?.id ?? ''}`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Checkout failed');
				setSubmitting(false);
			}
		},
		[cartHeaders, email, firstName, lastName, clearCart, router],
	);

	const handleSelectProvider = useCallback(
		async (providerName: string) => {
			setProvider(providerName);
			setError(null);
			setSubmitting(true);
			try {
				const startPayload: Record<string, unknown> = { provider: providerName };
				if (customerId) {
					startPayload.customer = { kind: 'existing', customerId };
				}
				const res = await fetch('/api/checkout/start', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(startPayload),
				});
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(data?.error || 'Could not start checkout');
				}
				const data: CheckoutStartResponse = await res.json();
				setPaymentData(data);

				if (providerName === 'cash') {
					await handleSubmitCheckout();
					return;
				}
				if (data.redirectUrl) {
					window.location.href = data.redirectUrl;
					return;
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Could not start checkout');
				setProvider(null);
			} finally {
				setSubmitting(false);
			}
		},
		[cartHeaders, customerId, handleSubmitCheckout],
	);

	const goToStep = useCallback((target: BookingStep) => {
		setStep(target);
	}, []);

	const questionsSkipped = questions.length === 0;

	const canEnter = useCallback(
		(target: BookingStep): boolean => {
			if (target === 'when') return true;
			if (target === 'who') return !!availability.selectedSlot && !whoSkipped;
			const slotAndStaffReady = !!availability.selectedSlot && (whoSkipped || !!confirmedStaffId);
			if (target === 'extras') return slotAndStaffReady;
			if (target === 'questions') return slotAndStaffReady && !questionsSkipped;
			if (target === 'details') return slotAndStaffReady;
			if (target === 'payment') return slotAndStaffReady && committed;
			return false;
		},
		[availability.selectedSlot, whoSkipped, confirmedStaffId, committed, questionsSkipped],
	);

	const stepCompleted = useMemo<Record<BookingStep, boolean>>(
		() => ({
			when: !!availability.selectedSlot,
			who: whoSkipped || !!confirmedStaffId,
			extras: step !== 'when' && step !== 'who' && step !== 'extras',
			questions: questionsSkipped || step === 'details' || step === 'payment',
			details: committed,
			payment: false,
		}),
		[availability.selectedSlot, whoSkipped, confirmedStaffId, step, committed, questionsSkipped],
	);

	const questionsValid = questions.every((q) => {
		if (!q.required) return true;
		const v = answers[q.id];
		if (q.type === 'checkbox') return v === 'true';
		return v != null && v.trim().length > 0;
	});

	const detailsValid = email.trim().length > 0;

	return {
		// Product
		product,
		activeVariant,
		variants,
		hasVariants,
		selectedVariantId,
		setSelectedVariantId,
		loading: productData.loading,
		error: error ?? productData.error,
		setError,
		fieldErrors,

		// Staff & location
		selectedStaffId,
		setSelectedStaffId: handlePreSelectStaff,
		confirmedStaffId,
		setConfirmedStaffId: handleStaffConfirm,
		selectedLocationId,
		setSelectedLocationId,
		finalStaffId,
		staffForLocation,
		slotStaff,
		whoSkipped,

		// Availability
		selectedDate: availability.selectedDate,
		setSelectedDate: handleDateSelect,
		slots: availability.slots,
		slotsLoading: availability.slotsLoading,
		selectedSlot: availability.selectedSlot,
		handleSlotSelect,

		// Attendees
		attendees,
		setAttendees,

		// Add-ons
		availableAddOns: addOns.availableAddOns,
		addOnsLoading: addOns.addOnsLoading,
		selectedAddOns: addOns.selectedAddOns,
		addOnsTotal: addOns.addOnsTotal,
		updateAddOnQuantity: addOns.updateQuantity,
		bookedDurationUnits,
		handleContinueFromExtras,

		// Customer
		email,
		setEmail,
		firstName,
		setFirstName,
		lastName,
		setLastName,
		customerId,

		// Questions
		questions,
		questionsSkipped,
		questionsValid,
		answers,
		setAnswers,
		handleContinueFromQuestions,

		// Details submit
		detailsValid,
		handleSubmitDetails,

		// Payment
		providers,
		provider,
		paymentData,
		handleSelectProvider,
		handleSubmitCheckout,

		// Flow
		step,
		setStep,
		goToStep,
		canEnter,
		stepCompleted,
		committed,
		submitting,
		isExpired,

		// Formatting
		formatCustom,
		formatTimeRange,
		timezone,
	};
}
