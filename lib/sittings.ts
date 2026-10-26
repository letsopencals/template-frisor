/**
 * The public-safe "sitting" shapes the account, the thank-you page and the preview fixtures render.
 * Built server-side in `lib/sittings-server.ts` from the SDK's appointment detail with explicit
 * allow-lists: no internal notes, no staff contact details, no customer credentials. Types only.
 */

export type SittingStatus = 'pending' | 'scheduled' | 'completed' | 'canceled';

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
	paymentStatus: 'unpaid' | 'paid' | 'partially-paid';
	providers: string[];
}

export interface Sitting {
	id: string;
	status: SittingStatus;
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
