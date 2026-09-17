import type { AppointmentStatusType } from '@opencals/storefront-sdk';

interface BadgeStyle {
	bg: string;
	text: string;
	label: string;
}

const BADGE_BASE = 'inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase';

/**
 * Base status badge: looks a status up in a config map and renders the pill.
 * Domain-specific badges below wrap this with their own maps. Consolidated here
 * because the same span markup was duplicated across the account/order/thank-you
 * pages.
 */
export function StatusBadge({
	status,
	config,
	className = '',
}: {
	status: string | null | undefined;
	config: Record<string, BadgeStyle>;
	className?: string;
}) {
	const key = status ?? '';
	const c = config[key] ?? { bg: 'bg-charcoal/10', text: 'text-[var(--color-cream)]', label: key || '—' };
	return (
		<span className={`${BADGE_BASE} ${c.bg} ${c.text} ${className}`.trim()}>{c.label}</span>
	);
}

const APPOINTMENT_STATUS: Record<string, BadgeStyle> = {
	scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
	confirmed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Confirmed' },
	completed: { bg: 'bg-charcoal/10', text: 'text-[var(--color-cream)]', label: 'Completed' },
	canceled: { bg: 'bg-red-100', text: 'text-red-300', label: 'Canceled' },
	pending: { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Pending' },
};

export function AppointmentStatusBadge({
	status,
	className,
}: {
	status: AppointmentStatusType | string | null | undefined;
	className?: string;
}) {
	return <StatusBadge status={status} config={APPOINTMENT_STATUS} className={className} />;
}

const PAYMENT_STATUS: Record<string, BadgeStyle> = {
	paid: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Paid' },
	unpaid: { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Unpaid' },
	'partially-paid': { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Partially Paid' },
};

export function PaymentStatusBadge({
	status,
	className,
}: {
	status: string | null | undefined;
	className?: string;
}) {
	return <StatusBadge status={status} config={PAYMENT_STATUS} className={className} />;
}

const FULFILLMENT_STATUS: Record<string, BadgeStyle> = {
	fulfilled: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Fulfilled' },
	unfulfilled: { bg: 'bg-charcoal/10', text: 'text-[var(--color-cream)]', label: 'Unfulfilled' },
	'partially-fulfilled': { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Partially Fulfilled' },
};

export function FulfillmentStatusBadge({
	status,
	className,
}: {
	status: string | null | undefined;
	className?: string;
}) {
	return <StatusBadge status={status} config={FULFILLMENT_STATUS} className={className} />;
}

const REFUND_STATUS: Record<string, BadgeStyle> = {
	'refund-owed': { bg: 'bg-red-100', text: 'text-red-300', label: 'Refund Owed' },
	'partially-refunded': { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Partially Refunded' },
	'fully-refunded': { bg: 'bg-red-100', text: 'text-red-300', label: 'Fully Refunded' },
};

export function RefundStatusBadge({
	status,
	className,
}: {
	status: string | null | undefined;
	className?: string;
}) {
	return <StatusBadge status={status} config={REFUND_STATUS} className={className} />;
}
