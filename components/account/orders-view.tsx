'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { OrderListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { money } from '@/lib/catalog';
import type { AccountInvoice } from '@/lib/account-types';

const PAY: Record<string, string> = { paid: 'Paid', unpaid: 'To pay at the shop', 'partially-paid': 'Part paid' };

function Invoices({ orderId }: { orderId: string }) {
	const { data, isLoading } = useSWR<AccountInvoice[]>(`/api/account/orders/${orderId}/invoices`, fetcher, { revalidateOnFocus: false });
	if (isLoading) return <p className="text-sm text-ink-3">Loading receipts…</p>;
	if (!data?.length) return <p className="text-sm text-ink-3">No receipts yet. They appear once the order is paid.</p>;
	return (
		<ul className="space-y-1 text-sm">
			{data.map((i) => (
				<li key={i.id} className="flex flex-wrap justify-between gap-3">
					<span>
						{i.kind === 'receipt' ? 'Receipt' : 'Invoice'} {i.number}
					</span>
					{i.url ? (
						<a href={i.url} target="_blank" rel="noreferrer" className="link">
							View
						</a>
					) : (
						<span className="text-ink-3">{i.status}</span>
					)}
				</li>
			))}
		</ul>
	);
}

/** /account/orders: each order with its date, total, payment state and receipts. */
export function OrdersView() {
	const { data, isLoading, error } = useSWR<{ data?: OrderListItemResponse[] }>('/api/account/orders?take=50', fetcher, { revalidateOnFocus: false });
	const [open, setOpen] = useState<string | null>(null);
	if (isLoading) return <div className="h-48 animate-pulse bg-paper-2" aria-busy="true" />;
	if (error) return <p className="text-oxblood">We couldn’t load your orders. Please refresh the page.</p>;
	const orders = data?.data ?? [];
	if (!orders.length) return <p className="text-ink-2">No orders yet.</p>;
	return (
		<ul className="border-t border-paper-3">
			{orders.map((o) => (
				<li key={o.id} className="border-b border-paper-3 py-4">
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
						<div className="w-40">
							<p className="font-semibold">{o.name}</p>
							<p className="text-sm text-ink-3">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(o.createdAt))}</p>
						</div>
						<p className="min-w-0 flex-1 text-sm text-ink-2">
							{o.lineItems.length} {o.lineItems.length === 1 ? 'appointment' : 'appointments'} · {PAY[o.paymentStatus] ?? o.paymentStatus}
						</p>
						<p className="tabular text-lg">{money(o.total, o.paymentCurrencyCode)}</p>
						<button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="btn btn-outline btn-sm">
							Receipts
						</button>
					</div>
					{open === o.id ? (
						<div className="mt-3 bg-paper-2 p-3">
							<Invoices orderId={o.id} />
						</div>
					) : null}
				</li>
			))}
		</ul>
	);
}
