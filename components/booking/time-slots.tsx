'use client';

import { useMemo } from 'react';
import type { CurrentAvailabilitySlot, ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';

interface TimeSlotsProps {
	slots: CurrentAvailabilitySlot[];
	selectedSlot: CurrentAvailabilitySlot | null;
	onSlotSelect: (slot: CurrentAvailabilitySlot) => void;
	loading: boolean;
	timezone: string;
	staffMembers?: StaffMember[];
}

type Bucket = 'morning' | 'afternoon' | 'evening';
const BUCKET_LABELS: Record<Bucket, string> = {
	morning: 'Morning',
	afternoon: 'Afternoon',
	evening: 'Evening',
};

function formatSlotTime(date: string, time: string, timezone: string): string {
	const utc = new Date(`${date}T${time}Z`);
	return utc.toLocaleTimeString('en-US', {
		timeZone: timezone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

function getLocalHour(date: string, time: string, timezone: string): number {
	const utc = new Date(`${date}T${time}Z`);
	const parts = utc.toLocaleTimeString('en-US', {
		timeZone: timezone,
		hour12: false,
		hour: '2-digit',
	});
	const hour = parseInt(parts, 10);
	return Number.isNaN(hour) ? 0 : hour;
}

function bucketFor(hour: number): Bucket {
	if (hour < 12) return 'morning';
	if (hour < 17) return 'afternoon';
	return 'evening';
}

export function TimeSlots({ slots, selectedSlot, onSlotSelect, loading, timezone, staffMembers = [] }: TimeSlotsProps) {
	const grouped = useMemo(() => {
		const groups: Record<Bucket, CurrentAvailabilitySlot[]> = { morning: [], afternoon: [], evening: [] };
		for (const slot of slots) {
			const hour = getLocalHour(slot.fromDate, slot.fromTime, timezone);
			groups[bucketFor(hour)].push(slot);
		}
		return groups;
	}, [slots, timezone]);

	if (loading) {
		return (
			<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--color-surface-2)]/40" />
					))}
				</div>
			</div>
		);
	}

	if (slots.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] py-10 text-center">
				<p className="text-sm text-[var(--color-cream-muted)]">No times available on this date.</p>
				<p className="mt-1 text-xs text-[var(--color-cream-dim)]">Try another day from the strip above.</p>
			</div>
		);
	}

	const buckets: Bucket[] = ['morning', 'afternoon', 'evening'];

	return (
		<div className="max-h-[440px] overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
			<div className="space-y-6">
				{buckets.map((bucket) => {
					const items = grouped[bucket];
					if (items.length === 0) return null;
					return (
						<section key={bucket}>
							<p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-cream-dim)]">
								{BUCKET_LABELS[bucket]} · {items.length}
							</p>
							<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
								{items.map((slot) => {
									const isSelected =
										selectedSlot?.fromDate === slot.fromDate && selectedSlot?.fromTime === slot.fromTime;
									const isFull = slot.attendees >= slot.maxAttendees;
									const timeStr = formatSlotTime(slot.fromDate, slot.fromTime, timezone);
									const slotStaff = staffMembers.filter((s) => slot.staffMemberIds?.includes(s.id));
									const firstStaff = slotStaff[0];

									return (
										<button
											key={`${slot.fromDate}-${slot.fromTime}`}
											onClick={() => !isFull && onSlotSelect(slot)}
											disabled={isFull}
											className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2.5 text-center transition-all ${
												isFull
													? 'cursor-not-allowed border-[var(--color-line)] opacity-40'
													: isSelected
														? 'border-[var(--color-copper)] bg-[var(--color-copper)] text-[var(--color-bg-deep)]'
														: 'border-[var(--color-line-strong)] bg-[var(--color-bg)] text-[var(--color-cream)] hover:border-[var(--color-copper)]/60'
											}`}
										>
											<span
												className={`heading-display text-base leading-none ${
													isSelected ? 'text-[var(--color-bg-deep)]' : ''
												}`}
											>
												{timeStr}
											</span>
											{firstStaff?.firstName && (
												<span
													className={`mt-1 text-[0.5rem] font-medium uppercase tracking-[0.18em] ${
														isSelected
															? 'text-[var(--color-bg-deep)]/70'
															: 'text-[var(--color-cream-dim)]'
													}`}
												>
													{firstStaff.firstName}
													{slotStaff.length > 1 && ` +${slotStaff.length - 1}`}
												</span>
											)}
										</button>
									);
								})}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
