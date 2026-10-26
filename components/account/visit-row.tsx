import Link from 'next/link';
import clsx from 'clsx';
import type { Sitting } from '@/lib/sittings';
import { bookHref } from '@/lib/catalog';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';

const STATUS: Record<Sitting['status'], string> = { scheduled: 'Booked', pending: 'Awaiting confirmation', completed: 'Done', canceled: 'Cancelled' };

/** One visit as a row: date, service, barber and shop, and Manage or Book again. */
export function VisitRow({ s, past }: { s: Sitting; past: boolean }) {
	const at = new Date(s.from).getTime();
	const tz = siteConfig.timeZone;
	const kit = s.lines.filter((l) => l.shelf && l.slug).map((l) => l.slug).join(',');
	return (
		<li className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-paper-3 py-4">
			<div className="w-full sm:w-44">
				<p className="font-semibold">{longDate(at, tz)}</p>
				<p className="text-sm text-ink-3">{timeLabel(at, tz)}</p>
			</div>
			<div className="min-w-0 flex-1">
				<p className="serif text-[1.08rem] leading-snug">
					{s.service.title}
					{s.service.option ? ` · ${s.service.option}` : ''}
				</p>
				<p className="text-sm text-ink-2">
					{s.barber ? `With ${s.barber.firstName}` : 'First free barber'}
					{s.shop ? ` · ${s.shop.title}` : ''}
					<span className={clsx('ml-2 text-xs', s.status === 'canceled' ? 'text-oxblood' : 'text-ink-3')}>{STATUS[s.status]}</span>
				</p>
			</div>
			<div className="flex gap-2">
				{past ? (
					<Link href={bookHref({ service: s.service.slug, barber: s.barber?.slug, shop: s.shop?.slug, kit: kit || undefined })} className="btn btn-primary btn-sm">
						Book again
					</Link>
				) : null}
				<Link href={`/account/visits/${s.id}`} className="btn btn-outline btn-sm">
					{past ? 'Details' : 'Manage'}
				</Link>
			</div>
		</li>
	);
}
