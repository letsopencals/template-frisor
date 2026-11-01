/**
 * The public-safe "sitting" shapes the account, the thank-you page and the preview fixtures render.
 * Built server-side in `lib/sittings-server.ts` from the SDK's appointment detail with explicit
 * allow-lists: no internal notes, no staff contact details, no customer credentials. Types only.
 */

export type SittingStatus = 'pending' | 'scheduled' | 'completed' | 'canceled';

/** Why a `pending` booking isn't confirmed yet. Null means confirmed (or being confirmed right now). */
export type PendingReason = 'awaiting_payment' | 'awaiting_approval';

export interface SittingLine {
	id: string;
	slug: string | null;
	title: string;
	quantity: number;
	unitPrice: number;
	image: string | null;
	/** A `shelf-*` product (picked up at the chair) rather than an in-chair extra. */
	shelf: boolean;
}

export interface SittingCharge {
	orderId: string;
	orderName: string;
	currency: string;
	orderTotal: number;
	paidTotal: number;
	balance: number;
	totalDiscount: number;
	paymentStatus: 'unpaid' | 'paid' | 'partially-paid' | 'voided';
	/** When an unpaid order must be paid by (ISO), if the shop set a deadline. */
	paymentDueAt: string | null;
	providers: string[];
}

export interface Sitting {
	id: string;
	status: SittingStatus;
	/** Set only while the booking waits for payment or for the shop to confirm it. */
	pendingReason: PendingReason | null;
	/** UTC ISO. */
	from: string;
	to: string;
	service: {
		id: string;
		slug: string;
		title: string;
		option: string | null;
		duration: number;
		price: number;
		image: string | null;
		allowCustomerCancel: boolean;
		allowCustomerReschedule: boolean;
		cancelGap: number;
		rescheduleGap: number;
	};
	barber: { id: string; slug: string; name: string; firstName: string; imageUrl: string | null } | null;
	shop: { id: string; slug: string; title: string; addressLines: string[]; latitude: number | null; longitude: number | null } | null;
	notes: { question: string; answer: string | null }[];
	lines: SittingLine[];
	charge: SittingCharge | null;
}

export interface SittingRecord {
	sittings: Sitting[];
	truncated: boolean;
}

export const isUpcoming = (s: Sitting, now = Date.now()) =>
	(s.status === 'scheduled' || s.status === 'pending') && new Date(s.from).getTime() > now;

/**
 * The reason a set of sittings is still waiting, or null when it's confirmed. Only `pending` with a reason
 * counts: right after checkout an automatic shop's booking is briefly `pending` with no reason while it's
 * confirmed in the background, and that is a confirmed booking. Payment wins over approval (pay first).
 */
export function waitingOn(sittings: Pick<Sitting, 'status' | 'pendingReason'>[]): PendingReason | null {
	const reasons = sittings.filter((s) => s.status === 'pending').map((s) => s.pendingReason);
	if (reasons.includes('awaiting_payment')) return 'awaiting_payment';
	if (reasons.includes('awaiting_approval')) return 'awaiting_approval';
	return null;
}

/** Payment state in words. Never a raw value: an unknown state reads as "Payment pending". */
export const PAYMENT_LABEL: Record<SittingCharge['paymentStatus'], string> = {
	paid: 'Paid',
	unpaid: 'To pay',
	'partially-paid': 'Part paid',
	voided: 'Cancelled — not charged',
};
export const paymentLabel = (status: string): string => PAYMENT_LABEL[status as SittingCharge['paymentStatus']] ?? 'Payment pending';

/** A sitting's state in words, with the reason when it's waiting. */
export function statusLabel(s: Pick<Sitting, 'status' | 'pendingReason'>): string {
	if (s.status === 'canceled') return 'Cancelled';
	if (s.status === 'completed') return 'Done';
	if (s.status === 'pending' && s.pendingReason === 'awaiting_payment') return 'Awaiting payment';
	if (s.status === 'pending' && s.pendingReason === 'awaiting_approval') return 'Awaiting confirmation';
	return 'Booked';
}
