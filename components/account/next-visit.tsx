import Link from 'next/link';
import type { Sitting } from '@/lib/sittings';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { sittingLength } from '@/lib/catalog';
import { directionsHref } from '@/lib/directions';
import { AppointmentLabel } from '@/components/confirmation/appointment-label';

/** The next visit on top of the account: the small label, the facts and what you can do. */
export function NextVisit({ s, shopShort }: { s: Sitting; shopShort: string }) {
	const at = new Date(s.from).getTime();
	const tz = siteConfig.timeZone;
	const shelf = s.lines.filter((l) => l.shelf);
	return (
		<section aria-label="Your next visit" className="grid gap-8 bg-paper-2 p-5 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
			<div className="flex justify-center">
				<AppointmentLabel id={s.id} size="sm" day={new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(at)} time={timeLabel(at, tz)} service={s.service.title} barber={s.barber?.firstName ?? null} shop={shopShort} />
			</div>
			<div>
				<p className="label text-brass-lo">Your next visit</p>
				<p className="display mt-2 text-3xl leading-tight sm:text-4xl">
					{longDate(at, tz)}, {timeLabel(at, tz)}
				</p>
				<p className="mt-2 text-ink-2">
					{s.service.option ? `${s.service.title} · ${s.service.option}` : s.service.title} · {sittingLength(s.service.duration)}
					<br />
					{s.barber ? `With ${s.barber.name}` : 'First free barber'}
					{s.shop ? ` · ${s.shop.title}, ${s.shop.addressLines[0] ?? ''}` : ''}
				</p>
				{shelf.length ? <p className="mt-2 text-sm text-ink-2">Waiting at the chair: {shelf.map((l) => l.title).join(', ')}</p> : null}
				<div className="mt-5 flex flex-wrap gap-2">
					<Link href={`/account/visits/${s.id}`} className="btn btn-primary">
						Move or cancel
					</Link>
					{s.shop ? (
						<a href={directionsHref(s.shop)} target="_blank" rel="noreferrer" className="btn btn-outline">
							Directions
						</a>
					) : null}
				</div>
			</div>
		</section>
	);
}
