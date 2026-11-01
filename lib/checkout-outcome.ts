'use client';

import type {
	AppointmentStatusType,
	CheckoutOrder,
	CheckoutResponse,
	PaymentInstructions,
	PaymentProviderName,
	StorefrontAppointmentPendingReason,
} from '@opencals/storefront-sdk';

/**
 * What checkout submit answered, kept in sessionStorage for the thank-you page: whether each booking is
 * confirmed or waiting (and on what), and how to pay when the method was bank transfer, an invoice or cash.
 * The payment instructions only come back from submit, so a reload in the same tab still shows them.
 */
export interface CheckoutOutcome {
	orderId: string;
	/** Order number, used as the bank transfer reference. */
	orderName: string | null;
	savedAt: number;
	/** The payment method the customer picked (provider name). */
	provider: PaymentProviderName | null;
	paymentStatus: CheckoutOrder['paymentStatus'] | null;
	paymentDueAt: string | null;
	instructions: PaymentInstructions | null;
	appointments: Record<string, { status: AppointmentStatusType; pendingReason: StorefrontAppointmentPendingReason | null }>;
}

const KEY = 'frisor:outcome';
const MAX_AGE = 6 * 60 * 60 * 1000;

export function saveOutcome(data: CheckoutResponse, provider: PaymentProviderName | null): void {
	const order = data.order;
	if (!order?.id) return;
	const appointments: CheckoutOutcome['appointments'] = {};
	for (const line of order.lineItems ?? []) {
		const a = line.appointment;
		if (a?.id) appointments[a.id] = { status: a.status, pendingReason: a.status === 'pending' ? (a.pendingReason ?? null) : null };
	}
	const outcome: CheckoutOutcome = {
		orderId: order.id,
		orderName: order.name ?? null,
		savedAt: Date.now(),
		provider: data.paymentInstructions?.provider ?? provider,
		paymentStatus: order.paymentStatus ?? null,
		paymentDueAt: data.paymentInstructions?.dueAt ?? order.paymentDueAt ?? null,
		instructions: data.paymentInstructions ?? null,
		appointments,
	};
	try {
		sessionStorage.setItem(KEY, JSON.stringify(outcome));
	} catch {
		/* private mode: the thank-you page falls back to "check your email" */
	}
}

export function readOutcome(orderId: string | null): CheckoutOutcome | null {
	if (!orderId) return null;
	try {
		const raw = sessionStorage.getItem(KEY);
		if (!raw) return null;
		const o = JSON.parse(raw) as CheckoutOutcome;
		return o.orderId === orderId && Date.now() - o.savedAt < MAX_AGE ? o : null;
	} catch {
		return null;
	}
}
