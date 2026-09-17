'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppointmentDetailResponse as Appointment, CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Button } from '@/components/ui/button';

export function RescheduleModal({
	appointment,
	onClose,
	onRescheduled,
}: {
	appointment: Appointment;
	onClose: () => void;
	onRescheduled: () => void;
}) {
	const [selectedDate, setSelectedDate] = useState('');
	const [slots, setSlots] = useState<CurrentAvailabilitySlot[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<CurrentAvailabilitySlot | null>(null);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const { formatCustom: fmtCustom, formatSlot, formatTime: fmtTime, timezone } = useDateFormatter();
	const productId = appointment.productId;

	// Generate next 30 days
	const dates: string[] = [];
	for (let i = 0; i < 30; i++) {
		const d = new Date();
		d.setDate(d.getDate() + i);
		dates.push(d.toISOString().split('T')[0] ?? '');
	}

	const fetchSlots = useCallback(async (date: string) => {
		setLoadingSlots(true);
		setSlots([]);
		setSelectedSlot(null);
		try {
			const params = new URLSearchParams({ productId, date, timezone });
			if (appointment.staffMemberId) params.set('staffMemberId', appointment.staffMemberId);
			if (appointment.locationId) params.set('locationId', appointment.locationId);

			const res = await fetch(`/api/availability?${params}`);
			if (res.ok) {
				const data = await res.json();
				// Availability response is an array of slot objects
				const availableSlots: CurrentAvailabilitySlot[] = Array.isArray(data) ? data : data?.slots ?? [];
				setSlots(availableSlots);
			}
		} catch {
			// silently fail
		} finally {
			setLoadingSlots(false);
		}
	}, [productId, timezone, appointment.staffMemberId, appointment.locationId]);

	useEffect(() => {
		if (selectedDate) {
			fetchSlots(selectedDate);
		}
	}, [selectedDate, fetchSlots]);

	async function handleReschedule() {
		if (!selectedSlot) return;
		setSubmitting(true);
		setError('');
		try {
			const res = await fetch(`/api/account/appointments/${appointment.id}/reschedule`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slot: {
						productId,
						fromDate: selectedSlot.fromDate,
						fromTime: selectedSlot.fromTime,
						toDate: selectedSlot.toDate,
						toTime: selectedSlot.toTime,
						staffMemberId: selectedSlot.staffMemberIds?.[0] ?? appointment.staffMemberId ?? null,
						locationId: selectedSlot.locationIds?.[0] ?? appointment.locationId ?? null,
					},
				}),
			});
			if (res.ok) {
				onRescheduled();
			} else {
				const data = await res.json();
				setError(data.error ?? 'Failed to reschedule appointment');
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--color-bg)] p-8" onClick={(e) => e.stopPropagation()}>
				<h3 className="font-display text-xl font-semibold text-[var(--color-cream)]">Reschedule Appointment</h3>
				<p className="mt-2 text-sm text-[var(--color-cream-muted)]">
					Choose a new date and time for your {appointment.product?.title ?? 'appointment'}.
				</p>

				{/* Date Selection */}
				<div className="mt-6">
					<label className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-cream)]">
						Select Date
					</label>
					<select
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						className="mt-2 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-cream)] focus:border-[var(--color-gold)] focus:outline-none"
					>
						<option value="">Choose a date...</option>
						{dates.map((date) => (
							<option key={date} value={date}>
								{fmtCustom(date + 'T00:00:00', 'dddd, MMMM D')}
							</option>
						))}
					</select>
				</div>

				{/* Time Slots */}
				{selectedDate ? (
					<div className="mt-6">
						<label className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-cream)]">
							Available Times
						</label>
						{loadingSlots ? (
							<div className="mt-3 space-y-2">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="h-10 animate-pulse rounded bg-[var(--color-surface)]" />
								))}
							</div>
						) : slots.length === 0 ? (
							<p className="mt-3 text-sm text-[var(--color-cream-muted)]">No available times for this date.</p>
						) : (
							<div className="mt-3 grid grid-cols-3 gap-2">
								{slots.map((slot, i) => {
									const isSelected = selectedSlot === slot;
									return (
										<button
											key={i}
											onClick={() => setSelectedSlot(slot)}
											className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
												isSelected
													? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-bg)]'
													: 'border-[var(--color-line)] text-[var(--color-cream)] hover:border-[var(--color-line-strong)]'
											}`}
										>
											{formatSlot(slot.fromDate, slot.fromTime, 'time')}
										</button>
									);
								})}
							</div>
						)}
					</div>
				) : null}

				{/* Review Changes */}
				{selectedSlot ? (
					<div className="mt-6 rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/10 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-cream)]">Review Changes</p>
						<div className="mt-3 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-[var(--color-cream-muted)]">Current</span>
								<span className="text-[var(--color-cream)]">
									{fmtCustom(appointment.from, 'MMM D')}
									{' at '}
									{fmtTime(appointment.from)}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-[var(--color-cream-muted)]">New</span>
								<span className="font-medium text-[var(--color-gold)]">
									{fmtCustom(selectedSlot.fromDate + 'T00:00:00', 'MMM D')}
									{' at '}
									{formatSlot(selectedSlot.fromDate, selectedSlot.fromTime, 'time')}
								</span>
							</div>
						</div>
					</div>
				) : null}

				{error ? (
					<div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
						{error}
					</div>
				) : null}

				<div className="mt-6 flex gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={submitting}
						className="flex-1"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={handleReschedule}
						disabled={!selectedSlot || submitting}
						className="flex-1"
					>
						{submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
					</Button>
				</div>
			</div>
		</div>
	);
}
