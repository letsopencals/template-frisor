'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDuration, formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { AppointmentDetailResponse as Appointment } from '@opencals/storefront-sdk';
import { AppointmentStatusBadge } from '@/components/ui/status-badge';
import { CancelModal } from '@/components/account/appointment-detail/cancel-modal';
import { RescheduleModal } from '@/components/account/appointment-detail/reschedule-modal';
import { Button } from '@/components/ui/button';

type ModalState = 'none' | 'cancel' | 'reschedule';

export default function AppointmentDetailPage() {
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const router = useRouter();
	const [appointment, setAppointment] = useState<Appointment | null>(null);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<ModalState>('none');

	const fetchAppointment = useCallback(async () => {
		try {
			const res = await fetch(`/api/account/appointments/${appointmentId}`);
			if (res.ok) {
				setAppointment(await res.json());
			}
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, [appointmentId]);

	const { formatCustom, formatTime } = useDateFormatter();

	useEffect(() => {
		fetchAppointment();
	}, [fetchAppointment]);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-[var(--color-surface)]" />
				<div className="h-64 animate-pulse rounded bg-[var(--color-surface)]" />
			</div>
		);
	}

	if (!appointment) {
		return (
			<div className="text-center">
				<p className="text-sm text-[var(--color-cream-muted)]">Appointment not found</p>
				<Link href="/account/appointments" className="mt-4 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline">
					Back to appointments
				</Link>
			</div>
		);
	}

	const durationMin = appointment.from && appointment.to
		? Math.round((new Date(appointment.to).getTime() - new Date(appointment.from).getTime()) / 60000)
		: 0;

	const isScheduled = appointment.status === 'scheduled';
	const now = Date.now();
	const appointmentStart = new Date(appointment.from).getTime();

	const cancelGapMs = (appointment.product?.cancelGap ?? 0) * 1000;
	const rescheduleGapMs = (appointment.product?.rescheduleGap ?? 0) * 1000;

	const canCancel = isScheduled && (appointmentStart - cancelGapMs) > now;
	const canReschedule = isScheduled && (appointmentStart - rescheduleGapMs) > now;

	return (
		<div>
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link href="/account/appointments" className="text-[var(--color-cream-muted)] transition-colors hover:text-[var(--color-cream)]">
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</Link>
				<div>
					<h1 className="font-display text-2xl font-semibold text-[var(--color-cream)]">
						{appointment.product?.title ?? 'Appointment'}
					</h1>
					<p className="mt-0.5 text-xs text-[var(--color-cream-muted)]">Appointment #{appointment.name}</p>
				</div>
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-3">
				{/* Main content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Appointment Details */}
					<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]">
								Appointment Details
							</h2>
							<AppointmentStatusBadge status={appointment.status} />
						</div>

						<div className="mt-5 space-y-4">
							{/* Date & Time */}
							<div className="flex items-start gap-3">
								<svg className="mt-0.5 h-4 w-4 text-[var(--color-cream-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<div>
									<p className="text-sm font-medium text-[var(--color-cream)]">
										{formatCustom(appointment.from, 'dddd, MMMM D, YYYY')}
									</p>
									<p className="mt-0.5 text-sm text-[var(--color-cream-muted)]">
										{formatTime(appointment.from)}
										{' - '}
										{formatTime(appointment.to)}
									</p>
									{durationMin > 0 && (
										<p className="mt-0.5 text-xs text-[var(--color-cream-muted)]">{formatDuration(durationMin * 60)}</p>
									)}
								</div>
							</div>

							{/* Location */}
							{appointment.location?.title && (
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-4 w-4 text-[var(--color-cream-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									<div>
										<p className="text-sm font-medium text-[var(--color-cream)]">{appointment.location.title}</p>
										{(appointment.addressLine1 || appointment.city) && (
											<p className="mt-0.5 text-sm text-[var(--color-cream-muted)]">
												{[appointment.addressLine1, appointment.city, appointment.state, appointment.postalCode].filter(Boolean).join(', ')}
											</p>
										)}
									</div>
								</div>
							)}

							{/* Staff Member */}
							{appointment.staffMember && (
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-4 w-4 text-[var(--color-cream-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<p className="text-sm font-medium text-[var(--color-cream)]">
										{[appointment.staffMember.firstName, appointment.staffMember.lastName].filter(Boolean).join(' ')}
									</p>
								</div>
							)}

							{/* Attendees */}
							{appointment.numberOfAttendees > 1 && (
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-4 w-4 text-[var(--color-cream-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<p className="text-sm font-medium text-[var(--color-cream)]">
										{appointment.numberOfAttendees} attendees
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Add-ons */}
					{(() => {
						const addOns = appointment.addOns ?? [];
						if (!addOns.length) return null;
						const currency = appointment.order?.paymentCurrencyCode ?? 'USD';
						return (
							<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
								<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]">
									Add-ons
								</h2>
								<div className="mt-4 divide-y divide-[var(--color-line)]">
									{addOns.map((a, idx) => (
										<div key={a.id ?? `${a.addOnId}-${idx}`} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
											<span className="text-sm font-medium text-[var(--color-cream)]">
												{a.addOn?.title ?? 'Add-on'}
												{(a.quantity ?? 1) > 1 && ` \u00d7 ${a.quantity}`}
											</span>
											{a.addOn?.price != null && (
												<span className="text-sm text-[var(--color-cream-muted)]">
													{formatPrice((a.addOn.price ?? 0) * (a.quantity ?? 1), currency)}
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})()}

					{/* Actions */}
					{(canCancel || canReschedule) && (
						<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]">
								Actions
							</h2>
							<div className="mt-4 flex flex-wrap gap-3">
								{canReschedule && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => setModal('reschedule')}
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										Reschedule
									</Button>
								)}
								{canCancel && (
									<button
										onClick={() => setModal('cancel')}
										className="flex items-center gap-2 rounded-full border border-red-500/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-600 transition-colors hover:bg-red-500/10"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
										Cancel Appointment
									</button>
								)}
							</div>
							{appointment.product?.cancelGap && appointment.product.cancelGap > 0 && (
								<p className="mt-3 text-xs text-[var(--color-cream-muted)]">
									Cancellation must be made at least {formatGap(appointment.product.cancelGap)} before the appointment.
								</p>
							)}
							{appointment.product?.rescheduleGap && appointment.product.rescheduleGap > 0 && (
								<p className="mt-1 text-xs text-[var(--color-cream-muted)]">
									Rescheduling must be done at least {formatGap(appointment.product.rescheduleGap)} before the appointment.
								</p>
							)}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Service Info */}
					{appointment.product && (
						<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]">
								Service
							</h2>
							<p className="mt-3 text-sm font-medium text-[var(--color-cream)]">{appointment.product.title}</p>
							{appointment.product.duration && (
								<p className="mt-1 text-xs text-[var(--color-cream-muted)]">{formatDuration(appointment.product.duration)}</p>
							)}
							{appointment.product.price != null && appointment.product.price > 0 && (
								<p className="mt-2 text-lg font-bold text-[var(--color-cream)]">
									{formatPrice(appointment.product.price, appointment.order?.paymentCurrencyCode ?? 'USD')}
								</p>
							)}
						</div>
					)}

					{/* Book Again */}
					{appointment.product?.slug && (
						<Link
							href={`/booking/${appointment.product.slug}`}
							className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
						>
							Book Again
						</Link>
					)}
				</div>
			</div>

			{/* Cancel Modal */}
			{modal === 'cancel' && (
				<CancelModal
					appointmentId={appointment.id}
					serviceName={appointment.product?.title ?? 'Appointment'}
					onClose={() => setModal('none')}
					onCanceled={() => router.push('/account/appointments')}
				/>
			)}

			{/* Reschedule Modal */}
			{modal === 'reschedule' && (
				<RescheduleModal
					appointment={appointment}
					onClose={() => setModal('none')}
					onRescheduled={() => {
						setModal('none');
						fetchAppointment();
					}}
				/>
			)}
		</div>
	);
}

function formatGap(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
	if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
	return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}
