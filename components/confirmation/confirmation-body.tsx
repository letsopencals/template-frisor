import Link from 'next/link';
import type { Sitting } from '@/lib/sittings';
import type { ShelfItem } from '@/lib/catalog';
import { bookHref, money, sittingLength } from '@/lib/catalog';
import { googleCalendarHref, icsHref, ICS_FILENAME, type CalendarEvent } from '@/lib/calendar';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { AppointmentLabel } from '@/components/confirmation/appointment-label';
import { RestockRow } from '@/components/confirmation/restock-row';
import { directionsHref } from '@/lib/directions';

export interface ShopRef {
	id: string;
	slug: string;
	short: string;
	transit: string;
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-paper-3 py-3.5 sm:grid-cols-[8rem_1fr]">
			<dt className="label pt-0.5 text-[0.62rem] text-ink-3">{term}</dt>
			<dd className="text-[0.98rem] leading-snug">{children}</dd>
		</div>
	);
}

/** The thank-you content for one or more appointments. Pure props, so /preview renders it too. */
export function ConfirmationBody({ sittings, shops, shelf, total, currency }: { sittings: Sitting[]; shops: ShopRef[]; shelf: ShelfItem[]; total: number | null; currency: string | null }) {
	const tz = siteConfig.timeZone;
	const first = sittings[0]!;
	const cur = currency ?? first.charge?.currency ?? siteConfig.currency;
	const at = new Date(first.from).getTime();
	const shopRef = shops.find((s) => s.id === first.shop?.id);
	const events: CalendarEvent[] = sittings.map((s) => ({
		uid: s.id,
		title: `${s.service.title}${s.barber ? ` with ${s.barber.firstName}` : ''} · ${siteConfig.name}`,
		start: new Date(s.from).getTime(),
		end: new Date(s.to).getTime(),
		location: s.shop ? [s.shop.title, ...s.shop.addressLines].join(', ') : undefined,
		description: s.lines.some((l) => l.shelf) ? 'Your shelf products are waiting at your station.' : undefined,
	}));
	const shelfLines = sittings.flatMap((s) => s.lines.filter((l) => l.shelf));
	const extras = sittings.flatMap((s) => s.lines.filter((l) => !l.shelf));
	const cadence = siteConfig.cadenceDays[first.service.slug];
	const nextDue = cadence ? at + cadence * 86_400_000 : null;
	const kit = shelfLines.map((l) => l.slug).filter(Boolean).join(',');
	const before = siteConfig.beforeYouSit[first.service.slug] ?? siteConfig.beforeYouSit.default ?? [];
	const paid = first.charge ? first.charge.paymentStatus === 'paid' : null;
	const dayShort = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(at);

	return (
		<div className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pt-14">
			<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
				<div className="order-2 flex justify-center bg-paper-2 px-4 py-10 lg:order-1 lg:items-center lg:py-16">
					<AppointmentLabel id={first.id} day={dayShort} time={timeLabel(at, tz)} service={first.service.option ? `${first.service.title} · ${first.service.option}` : first.service.title} barber={first.barber?.firstName ?? null} shop={shopRef?.short ?? first.shop?.title ?? ''} />
				</div>

				<div className="order-1 lg:order-2">
					<p className="label text-brass-lo">Booking confirmed</p>
					<h1 className="display mt-2 text-[2.6rem] leading-[1.02] sm:text-6xl">You’re booked in.</h1>
					<p className="mt-3 text-ink-2">A confirmation is on its way to your inbox.</p>

					<dl className="mt-6 border-t border-paper-3">
						{sittings.map((s) => {
							const t = new Date(s.from).getTime();
							return (
								<Fact key={s.id} term={sittings.length > 1 ? s.service.title : 'When'}>
									<span className="font-semibold">
										{longDate(t, tz)}, {timeLabel(t, tz)}
									</span>
									<span className="block text-sm text-ink-2">
										{s.service.option ? `${s.service.title} · ${s.service.option}` : s.service.title} · {sittingLength(s.service.duration)}
									</span>
								</Fact>
							);
						})}
						<Fact term="Where">
							{first.shop?.title}
							{first.shop?.addressLines.length ? <span className="block text-sm text-ink-2">{first.shop.addressLines.join(', ')}</span> : null}
							{shopRef?.transit ? <span className="block text-sm text-ink-3">{shopRef.transit}</span> : null}
						</Fact>
						<Fact term="Barber">{first.barber?.name ?? 'The first free barber'}</Fact>
						{shelfLines.length ? (
							<Fact term="At the chair">
								<ul>
									{shelfLines.map((l) => (
										<li key={l.id}>
											{l.title}
											{l.quantity > 1 ? ` ×${l.quantity}` : ''}
										</li>
									))}
								</ul>
								<span className="block text-sm text-ink-2">Packed and waiting at your station.</span>
							</Fact>
						) : null}
						{extras.length ? <Fact term="Extras">{extras.map((l) => l.title).join(', ')}</Fact> : null}
						{total !== null ? (
							<Fact term={paid === false ? 'To pay' : 'Total'}>
								<span className="tabular font-semibold">{money(total, cur)}</span>
								{paid === false ? <span className="block text-sm text-ink-2">Pay at the till after your appointment.</span> : null}
							</Fact>
						) : null}
					</dl>

					<div className="mt-6 flex flex-wrap gap-2">
						<a href={icsHref(events)} download={ICS_FILENAME} className="btn btn-primary">
							Add to calendar
						</a>
						<a href={googleCalendarHref(events[0]!)} target="_blank" rel="noreferrer" className="btn btn-outline">
							Google Calendar
						</a>
						{first.shop ? (
							<a href={directionsHref(first.shop)} target="_blank" rel="noreferrer" className="btn btn-outline">
								Directions
							</a>
						) : null}
						<Link href="/account" className="btn btn-outline">
							Manage booking
						</Link>
					</div>
					<p className="mt-3 text-sm text-ink-3">{siteConfig.policy.cancel}</p>
				</div>
			</div>

			<div className="mt-16 grid gap-10 border-t border-paper-3 pt-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
				<div>
					<h2 className="display text-3xl">Before you come</h2>
					<ul className="mt-4 space-y-2.5 text-[0.95rem] text-ink-2">
						{before.map((b) => (
							<li key={b} className="flex gap-3">
								<span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-brass" />
								{b}
							</li>
						))}
					</ul>
				</div>
				<RestockRow service={first.service.slug} bought={shelfLines.map((l) => l.slug ?? '')} shelf={shelf} currency={cur} next={{ service: first.service.slug, barber: first.barber?.slug, shop: first.shop?.slug }} />
			</div>

			{nextDue ? (
				<div className="mt-14 flex flex-col gap-5 bg-green px-6 py-8 text-paper sm:flex-row sm:items-center sm:justify-between sm:px-10">
					<div>
						<p className="label text-brass-hi">Your next one</p>
						<p className="display mt-2 text-3xl sm:text-4xl">Around {longDate(nextDue, tz)}</p>
						<p className="mt-1 text-sm text-paper/75">
							A {first.service.title.toLowerCase()} holds about {Math.round(cadence! / 7)} weeks. Book it now and keep {first.barber?.firstName ?? 'the same barber'}.
						</p>
					</div>
					<Link href={bookHref({ service: first.service.slug, barber: first.barber?.slug, shop: first.shop?.slug, kit: kit || undefined })} className="btn btn-brass btn-lg shrink-0">
						Book the next one
					</Link>
				</div>
			) : null}
		</div>
	);
}
