'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Order, CollectionMeta, OrderLineItem } from '@opencals/storefront-sdk';

// The SDK Order type is missing `id` but it's returned by the API
type OrderWithId = Order & { id: string };

export default function OrdersPage() {
	const [orders, setOrders] = useState<OrderWithId[]>([]);
	const [meta, setMeta] = useState<CollectionMeta | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	const { formatCustom } = useDateFormatter();

	const fetchOrders = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/account/orders?take=10&page=${p}`);
			if (res.ok) {
				const data: { data: OrderWithId[]; meta: CollectionMeta } = await res.json();
				setOrders(data.data ?? []);
				setMeta(data.meta ?? null);
			}
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchOrders(page);
	}, [page, fetchOrders]);

	return (
		<div>
			<h1 className="font-display text-3xl font-semibold text-[var(--color-cream)]">Orders</h1>
			<p className="mt-2 text-sm text-[var(--color-cream-muted)]">Your order history</p>

			{loading ? (
				<div className="mt-8 space-y-3">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-20 animate-pulse rounded bg-[var(--color-surface)]" />
					))}
				</div>
			) : orders.length === 0 ? (
				<div className="mt-12 text-center">
					<svg className="mx-auto h-12 w-12 text-[var(--color-cream-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
					<p className="mt-4 text-sm text-[var(--color-cream-muted)]">No orders yet</p>
					<Link
						href="/services"
						className="mt-4 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline"
					>
						Book a service to get started
					</Link>
				</div>
			) : (
				<>
					<div className="mt-8 divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
						{orders.map((order) => (
							<Link key={order.id} href={`/account/orders/${order.id}`} className="block p-4 sm:p-5 transition-colors hover:bg-[var(--color-surface)]/30">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm font-medium text-[var(--color-cream)]">
											Order #{order.name}
										</p>
										<p className="mt-0.5 text-xs text-[var(--color-cream-muted)]">
											{formatCustom(order.createdAt, 'ddd, MMM D, YYYY')}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold text-[var(--color-cream)]">
											{formatPrice(order.total, order.paymentCurrencyCode)}
										</p>
										<PaymentStatusBadge status={order.paymentStatus} />
									</div>
								</div>

								{/* Line items */}
								{order.lineItems && order.lineItems.length > 0 && (
									<div className="mt-3 space-y-1">
										{order.lineItems.map((item: OrderLineItem, i: number) => (
											<div key={i} className="flex justify-between text-xs text-[var(--color-cream-muted)]">
												<span>{item.appointment?.product?.title ?? 'Service'}</span>
												<span>{formatPrice(item.total ?? 0, order.paymentCurrencyCode)}</span>
											</div>
										))}
									</div>
								)}
							</Link>
						))}
					</div>

					{/* Pagination */}
					{meta && meta.pageCount > 1 && (
						<div className="mt-6 flex items-center justify-center gap-2">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1}
								className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-cream)] transition-colors hover:bg-[var(--color-surface)] disabled:opacity-30"
							>
								Previous
							</button>
							<span className="text-xs text-[var(--color-cream-muted)]">
								Page {meta.page} of {meta.pageCount}
							</span>
							<button
								onClick={() => setPage((p) => Math.min(meta.pageCount, p + 1))}
								disabled={page >= meta.pageCount}
								className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-cream)] transition-colors hover:bg-[var(--color-surface)] disabled:opacity-30"
							>
								Next
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function PaymentStatusBadge({ status }: { status: Order['paymentStatus'] }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		paid: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Paid' },
		unpaid: { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Unpaid' },
		'partially-paid': { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Partial' },
	};

	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-[var(--color-cream)]', label: status };

	return (
		<span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}
