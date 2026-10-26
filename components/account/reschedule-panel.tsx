'use client';

import { useMemo, useState } from 'react';
import type { Sitting } from '@/lib/sittings';
import { localDate, slotOf, startsByDay, startsOf } from '@/lib/slots';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { invalidateStudioAvailability, useStudioAvailability } from '@/hooks/use-studio-availability';
import { DateStrip } from '@/components/book/date-strip';
import { SlotGrid } from '@/components/book/slot-grid';

/**
 * Move a visit: same service, shop and barber; the date strip directly above the times (the
 * booking flow's own controls), then one confirm button.
 */
export function ReschedulePanel({ s, onDone, onCancel }: { s: Sitting; onDone: () => void; onCancel: () => void }) {
	const tz = siteConfig.timeZone;
	const { byLocation, loading } = useStudioAvailability(s.service.id, s.shop ? [s.shop.id] : []);
	const avail = s.shop ? byLocation[s.shop.id] : null;
	const current = new Date(s.from).getTime();
	const starts = useMemo(() => startsOf(avail, s.barber?.id ?? null).filter((x) => x.at !== current), [avail, s.barber?.id, current]);
	const days = useMemo(() => startsByDay(starts, tz), [starts, tz]);
	const [dayChoice, setDay] = useState<string | null>(null);
	const day = dayChoice && days.has(dayChoice) ? dayChoice : (days.keys().next().value ?? null);
	const [at, setAt] = useState<number | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirm = async () => {
		if (at === null) return;
		setBusy(true);
		setError(null);
		const res = await fetch(`/api/account/appointments/${s.id}/reschedule`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ slot: { productId: s.service.id, ...slotOf(at, s.service.duration), staffMemberId: s.barber?.id ?? starts.find((x) => x.at === at)?.staffIds[0], locationId: s.shop?.id } }),
		}).catch(() => null);
		setBusy(false);
		if (!res?.ok) {
			const body = await res?.json().catch(() => null);
			setError(body?.error ?? 'We couldn’t move it to that time. Please pick another.');
			invalidateStudioAvailability();
			return;
		}
		invalidateStudioAvailability();
		onDone();
	};

	return (
		<div className="apoth p-5 sm:p-6">
			<div className="flex items-baseline justify-between gap-3">
				<h2 className="display text-2xl">Pick a new time</h2>
				<button type="button" onClick={onCancel} className="link text-sm text-ink-2">
					Keep the current time
				</button>
			</div>
			<p className="mt-1 text-sm text-ink-2">
				Same service{s.barber ? `, with ${s.barber.firstName}` : ''}
				{s.shop ? ` at ${s.shop.title}` : ''}.
			</p>
			<div className="mt-5">
				{loading ? (
					<div className="h-40 animate-pulse bg-paper-2" />
				) : !starts.length ? (
					<p className="text-ink-2">No other free times in the next four weeks. Call the shop on {siteConfig.contact.phone}.</p>
				) : (
					<>
						<DateStrip
							days={days}
							value={day}
							onChange={(d) => {
								setDay(d);
								setAt(null);
							}}
							today={localDate(Date.now(), tz)}
						/>
						<div className="mt-5">
							<SlotGrid starts={day ? (days.get(day) ?? []) : []} value={at} onPick={setAt} timeZone={tz} />
						</div>
					</>
				)}
			</div>
			{error ? (
				<p role="alert" className="mt-4 text-sm text-oxblood">
					{error}
				</p>
			) : null}
			<div className="sticky bottom-0 -mx-5 mt-6 border-t border-paper-3 bg-[#fbf8f2] px-5 py-3 sm:-mx-6 sm:px-6">
				<button type="button" onClick={confirm} disabled={at === null || busy} className="btn btn-primary btn-lg w-full">
					{busy ? 'Moving…' : at !== null ? `Move to ${longDate(at, tz)}, ${timeLabel(at, tz)}` : 'Pick a time'}
				</button>
			</div>
		</div>
	);
}
