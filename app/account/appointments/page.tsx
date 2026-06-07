'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatDuration } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Appointment, CollectionMeta, AppointmentStatusType } from '@opencals/storefront-sdk';

export default function AppointmentsPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [meta, setMeta] = useState<CollectionMeta | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	const { formatCustom, formatTime } = useDateFormatter();

	const fetchAppointments = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/account/appointments?take=10&page=${p}`);
			if (res.ok) {
				const data: { data: Appointment[]; meta: CollectionMeta } = await res.json();
				setAppointments(data.data ?? []);
				setMeta(data.meta ?? null);
			}
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAppointments(page);
	}, [page, fetchAppointments]);

	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-display text-3xl font-semibold text-[var(--color-cream)]">Appointments</h1>
					<p className="mt-2 text-sm text-[var(--color-cream-muted)]">Your past and upcoming appointments</p>
				</div>
				<Link
					href="/services"
					className="hidden rounded-full bg-[var(--color-gold)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)] sm:inline-block"
				>
					Book New
				</Link>
			</div>

			{loading ? (
				<div className="mt-8 space-y-3">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-20 animate-pulse rounded bg-[var(--color-surface)]" />
					))}
				</div>
			) : appointments.length === 0 ? (
				<div className="mt-12 text-center">
					<svg className="mx-auto h-12 w-12 text-[var(--color-cream-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<p className="mt-4 text-sm text-[var(--color-cream-muted)]">No appointments found</p>
					<Link
						href="/services"
						className="mt-4 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline"
					>
						Book your first appointment
					</Link>
				</div>
			) : (
				<>
					<div className="mt-8 divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
						{appointments.map((appt) => {
							const durationMin = appt.from && appt.to
								? Math.round((new Date(appt.to).getTime() - new Date(appt.from).getTime()) / 60000)
								: 0;

							return (
								<Link key={appt.id} href={`/account/appointments/${appt.id}`} className="flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-[var(--color-surface)]/30">
									{/* Date badge */}
									<div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--color-surface)]">
										<span className="text-[10px] font-semibold uppercase text-[var(--color-cream-muted)]">
											{formatCustom(appt.from, 'MMM')}
										</span>
										<span className="text-lg font-bold text-[var(--color-cream)]">
											{formatCustom(appt.from, 'D')}
										</span>
									</div>

									{/* Details */}
									<div className="flex-1">
										<p className="text-sm font-medium text-[var(--color-cream)]">
											{appt.product?.title ?? 'Appointment'}
										</p>
										<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
											<span className="text-xs text-[var(--color-cream-muted)]">
												{formatTime(appt.from)}
											</span>
											{durationMin > 0 && (
												<span className="text-xs text-[var(--color-cream-muted)]">{formatDuration(durationMin)}</span>
											)}
											{appt.staffMember && (
												<span className="text-xs text-[var(--color-cream-muted)]">
													with {[appt.staffMember.firstName, appt.staffMember.lastName].filter(Boolean).join(' ')}
												</span>
											)}
											{appt.location?.title && (
												<span className="text-xs text-[var(--color-cream-muted)]">
													{appt.location.title}
												</span>
											)}
										</div>
									</div>

									{/* Status */}
									<div className="text-right">
										<StatusBadge status={appt.status} />
										{appt.numberOfAttendees > 1 && (
											<p className="mt-1 text-xs text-[var(--color-cream-muted)]">
												{appt.numberOfAttendees} attendees
											</p>
										)}
									</div>
								</Link>
							);
						})}
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

function StatusBadge({ status }: { status: AppointmentStatusType }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
		confirmed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Confirmed' },
		completed: { bg: 'bg-charcoal/10', text: 'text-[var(--color-cream)]', label: 'Completed' },
		canceled: { bg: 'bg-red-100', text: 'text-red-300', label: 'Canceled' },
		pending: { bg: 'bg-amber-100', text: 'text-amber-300', label: 'Pending' },
	};

	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-[var(--color-cream)]', label: status };

	return (
		<span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}
