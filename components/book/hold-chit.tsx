'use client';

import { money } from '@/lib/catalog';
import { longDate, timeLabel } from '@/lib/when';
import type { ChairBooking } from '@/hooks/use-chair-booking';
import { TagButton } from '@/components/ui/tag';

/** The chit the barber writes before you sit: what, who, when, and the running total. Holds the chair. */
export function HoldChit({ b, currency }: { b: ChairBooking; currency: string }) {
	const extras = b.addOns.addOnsTotal;
	return (
		<div className="paper relative px-5 pb-5 pt-4">
			<p className="label text-walnut">Your chit</p>
			<dl className="mt-3 space-y-1.5 text-sm">
				<div className="flex justify-between gap-3">
					<dt className="text-ink-2">{b.service?.name ?? 'Service'}</dt>
					<dd className="tabular">{b.service ? money(b.service.price, currency) : '—'}</dd>
				</div>
				{extras ? (
					<div className="flex justify-between gap-3">
						<dt className="text-ink-2">Shelf &amp; extras</dt>
						<dd className="tabular">{money(extras, currency)}</dd>
					</div>
				) : null}
				<div className="flex justify-between gap-3 text-ink-2">
					<dt>{b.shop?.short ?? 'Shop'}</dt>
					<dd className="text-right">{b.selected ? `${longDate(b.selected.at, b.timeZone)}, ${timeLabel(b.selected.at, b.timeZone)}` : 'Pick a time'}</dd>
				</div>
				<div className="flex justify-between gap-3 text-ink-2">
					<dt>Barber</dt>
					<dd>{b.finalBarber?.name ?? (b.barber?.name || 'First free')}</dd>
				</div>
			</dl>
			<div className="mt-3 flex items-baseline justify-between border-t-2 border-ink pt-3">
				<span className="label">Total</span>
				<span className="serif tabular text-3xl">{money(b.total, currency)}</span>
			</div>
			{b.error ? (
				<p role="alert" className="mt-3 border-l-2 border-oxblood pl-3 text-sm text-oxblood">
					{b.error}
				</p>
			) : null}
			<TagButton variant="ink" size="lg" full className="mt-4" disabled={b.missing.length > 0 || b.holding} onClick={b.hold}>
				{b.holding ? 'Holding the chair…' : 'Hold the chair'}
			</TagButton>
			<p className="mt-2 text-center text-xs text-ink-3">{b.missing.length ? `Still need ${b.missing.join(' and ')}.` : 'We hold it while you settle up on the docket.'}</p>
		</div>
	);
}
