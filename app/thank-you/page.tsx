'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Order, OrderLineItem, OrderTransaction } from '@opencals/storefront-sdk';

export default function ThankYouPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" />
				</div>
			}
		>
			<ThankYouContent />
		</Suspense>
	);
}

function ThankYouContent() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get('orderId');
	const { status: authStatus } = useSession();

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(!!orderId);

	useEffect(() => {
		if (!orderId) return;

		async function fetchOrder() {
			try {
				const res = await fetch(`/api/account/orders/${orderId}`);
				if (res.ok) {
					setOrder(await res.json());
				}
			} catch {
				/* swallow — show basic confirmation */
			} finally {
				setLoading(false);
			}
		}

		fetchOrder();
	}, [orderId]);

	const { formatCustom, formatDate } = useDateFormatter();
	const appointments = order?.appointments ?? [];
	const lineItems: OrderLineItem[] = order?.lineItems ?? [];
	const currency = order?.paymentCurrencyCode ?? 'USD';
	const transactions = order?.transactions;
	const successTransaction = transactions?.find((t: OrderTransaction) => t.status === 'success');

	return (
		<section className="bg-[var(--color-bg)] pt-32 pb-20 lg:pt-40 lg:pb-32">
			<div className="mx-auto max-w-[1100px] px-6 lg:px-10">
				{/* Success banner */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="text-center"
				>
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)]/15">
						<svg className="h-8 w-8 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>

					<h1 className="mt-6 font-display text-3xl font-semibold text-[var(--color-cream)] md:text-4xl">
						Thank you for your booking!
					</h1>

					{order?.name && (
						<p className="mt-3 text-sm text-[var(--color-cream-muted)]">
							Order <span className="font-semibold text-[var(--color-cream)]">#{order.name}</span> has been confirmed.
						</p>
					)}

					{order?.customer?.email && (
						<p className="mt-1 text-sm text-[var(--color-cream-muted)]">
							A confirmation has been sent to{' '}
							<span className="font-medium text-[var(--color-cream)]">{order.customer.email}</span>.
						</p>
					)}
				</motion.div>

				{loading ? (
					<div className="mt-12 space-y-6">
						<div className="h-48 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
						<div className="h-48 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
					</div>
				) : (
					<div className="mt-12 grid gap-8 lg:grid-cols-3">
						{/* Main content */}
						<div className="space-y-6 lg:col-span-2">
							{appointments.length > 0 && (
								<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
									<h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)]">
										Your Appointments
									</h2>
									<div className="mt-4 divide-y divide-[var(--color-line)]">
										{appointments.map((appt, i) => (
											<div key={appt.id ?? i} className="py-4 first:pt-0 last:pb-0">
												<div className="flex items-start justify-between">
													<p className="text-sm font-medium text-[var(--color-cream)]">
														{appt.product?.title ?? 'Service'}
													</p>
													<AppointmentStatusBadge status={appt.status} />
												</div>

												<div className="mt-3 space-y-2">
													{appt.from && (
														<div className="flex items-center gap-2 text-xs text-[var(--color-cream-muted)]">
															<svg className="h-3.5 w-3.5 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
															</svg>
															<span>{formatCustom(appt.from, 'dddd, MMMM D, YYYY')}</span>
															<span>
																{formatCustom(appt.from, 'h:mm A')}
																{appt.to && (
																	<>
																		{' - '}
																		{formatCustom(appt.to, 'h:mm A')}
																	</>
																)}
															</span>
														</div>
													)}

													{appt.location?.title && (
														<div className="flex items-center gap-2 text-xs text-[var(--color-cream-muted)]">
															<svg className="h-3.5 w-3.5 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
																<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
															</svg>
															<span>{appt.location.title}</span>
														</div>
													)}

													{appt.staffMember && (
														<div className="flex items-center gap-2 text-xs text-[var(--color-cream-muted)]">
															<svg className="h-3.5 w-3.5 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
															</svg>
															<span>
																{[appt.staffMember.firstName, appt.staffMember.lastName].filter(Boolean).join(' ')}
															</span>
														</div>
													)}

													{appt.numberOfAttendees > 1 && (
														<div className="flex items-center gap-2 text-xs text-[var(--color-cream-muted)]">
															<svg className="h-3.5 w-3.5 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
															</svg>
															<span>{appt.numberOfAttendees} attendees</span>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Payment Information */}
							<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
								<h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)]">
									Payment Information
								</h2>
								<div className="mt-4 space-y-3">
									{successTransaction && (
										<>
											<div className="flex justify-between text-sm">
												<span className="text-[var(--color-cream-muted)]">Payment Method</span>
												<span className="font-medium capitalize text-[var(--color-cream)]">
													{successTransaction.gateway ?? 'N/A'}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-[var(--color-cream-muted)]">Amount</span>
												<span className="font-medium text-[var(--color-cream)]">
													{formatPrice(successTransaction.amount ?? 0, currency)}
												</span>
											</div>
											{successTransaction.createdAt && (
												<div className="flex justify-between text-sm">
													<span className="text-[var(--color-cream-muted)]">Date</span>
													<span className="font-medium text-[var(--color-cream)]">
														{formatDate(successTransaction.createdAt)}
													</span>
												</div>
											)}
										</>
									)}
									<div className="flex justify-between text-sm">
										<span className="text-[var(--color-cream-muted)]">Status</span>
										<span className={`font-medium ${order?.isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
											{order?.isFullyPaid ? 'Paid' : 'Pending'}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Order Summary */}
							<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
								<h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)]">
									Order Summary
								</h2>
								{lineItems.length > 0 && (
									<div className="mt-4 divide-y divide-[var(--color-line)]">
										{lineItems.map((item, i) => (
											<div key={i} className="flex justify-between py-2">
												<div>
													<p className="text-sm text-[var(--color-cream)]">
														{item.appointment?.product?.title ?? 'Service'}
													</p>
													{item.quantity > 1 && (
														<p className="text-xs text-[var(--color-cream-muted)]">Qty: {item.quantity}</p>
													)}
												</div>
												<p className="text-sm font-medium text-[var(--color-cream)]">
													{formatPrice(item.total ?? 0, currency)}
												</p>
											</div>
										))}
									</div>
								)}

								<div className="mt-4 space-y-2 border-t border-[var(--color-line)] pt-4">
									<div className="flex justify-between text-sm">
										<span className="text-[var(--color-cream-muted)]">Subtotal</span>
										<span className="text-[var(--color-cream)]">{formatPrice(order?.subtotal ?? 0, currency)}</span>
									</div>
									{(order?.totalTax ?? 0) > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-[var(--color-cream-muted)]">Tax</span>
											<span className="text-[var(--color-cream)]">{formatPrice(order?.totalTax ?? 0, currency)}</span>
										</div>
									)}
									<div className="flex justify-between border-t border-[var(--color-line)] pt-2">
										<span className="text-sm font-semibold text-[var(--color-cream)]">Total</span>
										<span className="text-lg font-bold text-[var(--color-gold)]">
											{formatPrice(order?.total ?? 0, currency)}
										</span>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="space-y-3">
								{authStatus === 'authenticated' ? (
									<>
										<Link
											href="/account/appointments"
											className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
										>
											View Appointments
										</Link>
										<Link
											href="/account/orders"
											className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line-strong)] px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:border-[var(--color-cream)]/40"
										>
											View Orders
										</Link>
									</>
								) : (
									<div className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 p-4">
										<p className="text-xs font-medium text-[var(--color-cream)]">Create an account</p>
										<p className="mt-1 text-xs text-[var(--color-cream-muted)]">
											Sign up to manage your appointments and view order history.
										</p>
										<Link
											href="/auth/sign-up"
											className="mt-3 inline-block text-xs font-semibold text-[var(--color-gold)] hover:underline"
										>
											Sign Up
										</Link>
									</div>
								)}
								<Link
									href="/services"
									className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line-strong)] px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:border-[var(--color-cream)]/40"
								>
									Book Another Service
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

function AppointmentStatusBadge({ status }: { status?: string }) {
	const normalized = (status ?? '').toLowerCase().replace(/_/g, ' ');
	const isScheduled = normalized === 'scheduled';

	return (
		<span
			className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
				isScheduled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
			}`}
		>
			{isScheduled ? 'Scheduled' : normalized || 'Pending'}
		</span>
	);
}
