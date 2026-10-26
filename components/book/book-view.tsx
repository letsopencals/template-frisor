'use client';

import type { Barber, Service, Shop } from '@/lib/catalog';
import { useChairBooking, type ChairInitial } from '@/hooks/use-chair-booking';
import { ChairPicker } from '@/components/book/chair-picker';
import { MirrorDial } from '@/components/book/mirror-dial';
import { TowelDays } from '@/components/book/towel-days';
import { TimeList } from '@/components/book/time-list';
import { ShelfTray } from '@/components/book/shelf-tray';
import { BarberNotes } from '@/components/book/barber-notes';
import { HoldChit } from '@/components/book/hold-chit';

/**
 * /book: one page, three zones, no steps (DESIGN.md). The chair (service, shop, barber),
 * the mirror (towel-tag days, the dial, the time list) and the shelf (kit, extras, notes, chit).
 */
export function BookView({ services, barbers, shops, initial, currency }: { services: Service[]; barbers: Barber[]; shops: Shop[]; initial: ChairInitial; currency: string }) {
	const b = useChairBooking({ services, barbers, shops, initial });
	const portrait = b.barber?.imageUrl ?? b.finalBarber?.imageUrl ?? b.shop?.image ?? null;

	return (
		<div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[19rem_minmax(0,1fr)_22rem] lg:gap-10 xl:grid-cols-[21rem_minmax(0,1fr)_24rem]">
			<section aria-label="Service, shop and barber">
				<ChairPicker b={b} currency={currency} />
			</section>

			<section aria-label="Day and time" className="min-w-0">
				<p className="label text-brass">5 · The day &amp; the minute</p>
				<div className="mt-3">
					<TowelDays days={b.days} value={b.day} onChange={b.chooseDay} timeZone={b.timeZone} />
				</div>
				<div className="mt-6">
					{b.loading && !b.starts.length ? (
						<div className="mx-auto flex aspect-square max-w-[420px] items-center justify-center rounded-full border border-line">
							<span className="pole h-2 w-28" aria-label="Reading the book" />
						</div>
					) : (
						<MirrorDial day={b.day} starts={b.dayStarts} selected={b.selected?.at ?? null} onPick={b.chooseStart} portrait={portrait} caption={b.dayStarts.length ? `${b.dayStarts.length} free` : 'Full'} />
					)}
				</div>
				<div className="mx-auto mt-8 max-w-xl">
					<TimeList starts={b.dayStarts} value={b.selected?.at ?? null} onPick={b.chooseStart} timeZone={b.timeZone} />
				</div>
			</section>

			<section aria-label="The shelf and your chit" className="space-y-8 lg:sticky lg:top-6 lg:self-start">
				<div className="tray -mx-5 px-5 py-6 sm:mx-0">
					<ShelfTray b={b} currency={currency} />
				</div>
				<BarberNotes b={b} />
				<HoldChit b={b} currency={currency} />
			</section>
		</div>
	);
}
