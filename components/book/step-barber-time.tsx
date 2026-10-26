'use client';

import { useHydrated } from '@/hooks/use-hydrated';
import { localDate } from '@/lib/slots';
import type { ChairBooking } from '@/hooks/use-chair-booking';
import { BarberRow } from '@/components/book/barber-row';
import { DateStrip } from '@/components/book/date-strip';
import { SlotGrid } from '@/components/book/slot-grid';

function Skeleton() {
	return (
		<div aria-hidden className="animate-pulse space-y-3">
			<div className="flex gap-1.5">
				{Array.from({ length: 7 }, (_, i) => (
					<div key={i} className="h-[76px] w-[58px] bg-paper-2" />
				))}
			</div>
			<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 xl:grid-cols-8">
				{Array.from({ length: 16 }, (_, i) => (
					<div key={i} className="h-12 bg-paper-2" />
				))}
			</div>
		</div>
	);
}

/**
 * Step 2: who and when. Barber portraits, then the date strip directly above the day's times.
 * Choosing a time fills the "Your chair" panel and enables Continue.
 */
export function StepBarberTime({ b }: { b: ChairBooking }) {
	const hydrated = useHydrated();
	const today = hydrated ? localDate(Date.now(), b.timeZone) : null;
	const noTimes = !b.loading && b.starts.length === 0;

	return (
		<div>
			{b.lostSlot && b.error ? (
				<p role="alert" className="mb-6 border-l-2 border-oxblood bg-oxblood/5 py-2 pl-3 text-sm text-oxblood">
					{b.error}
				</p>
			) : null}
			<p className="label text-ink-2">With whom?</p>
			<div className="mt-3">
				<BarberRow barbers={b.candidates} value={b.staffChoice} onChange={b.chooseBarber} nextBy={b.nextByBarber} timeZone={b.timeZone} loading={b.loading} />
			</div>

			<div className="mt-8" id="book-when">
				<p className="label text-ink-2">When?</p>
				<div className="mt-3">
					{b.loading || !today ? (
						<Skeleton />
					) : noTimes ? (
						<div className="apoth p-6">
							<p className="serif text-lg">No free times in the next four weeks{b.barber ? ` with ${b.barber.firstName}` : ' at this shop'}.</p>
							<p className="mt-1 text-sm text-ink-2">{b.barber ? 'Try any barber, or another shop.' : 'Try another shop.'}</p>
							{b.barber ? (
								<button type="button" onClick={() => b.chooseBarber('any')} className="btn btn-outline btn-sm mt-4">
									Show any barber
								</button>
							) : null}
						</div>
					) : (
						<>
							<DateStrip days={b.days} value={b.day} onChange={b.chooseDay} today={today} />
							<div className="mt-5" aria-live="polite">
								<SlotGrid starts={b.dayStarts} value={b.selected?.at ?? null} onPick={b.chooseStart} timeZone={b.timeZone} />
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
