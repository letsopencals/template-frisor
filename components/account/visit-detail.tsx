'use client';

import Link from 'next/link';
import { useState } from 'react';
import { bookHref, money, sittingLength } from '@/lib/catalog';
import { isUpcoming } from '@/lib/sittings';
import { googleCalendarHref, icsHref, ICS_FILENAME } from '@/lib/calendar';
import { directionsHref } from '@/lib/directions';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useSittings } from '@/components/account/use-sittings';
import { ReschedulePanel } from '@/components/account/reschedule-panel';

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-paper-3 py-3 sm:grid-cols-[8rem_1fr]">
			<dt className="label pt-0.5 text-[0.62rem] text-ink-3">{term}</dt>
			<dd>{children}</dd>
		</div>
	);
}

function gapLabel(seconds: number): string {
	const h = Math.round(seconds / 3600);
	return h >= 24 && h % 24 === 0 ? `${h / 24} day${h === 24 ? '' : 's'}` : `${h} hour${h === 1 ? '' : 's'}`;
}

/** One visit: the facts, then move / cancel (within the shop's notice), calendar and directions. */
export function VisitDetail({ id }: { id: string }) {
	const { sittings, loading, refresh } = useSittings();
	const [mode, setMode] = useState<'view' | 'move' | 'cancel'>('view');
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const s = sittings.find((x) => x.id === id);
	if (loading) return <div className="h-64 animate-pulse bg-paper-2" aria-busy="true" />;
	if (!s) return <p className="text-ink-2">We couldn’t find that visit. <Link href="/account" className="link">Back to your visits</Link></p>;

	const tz = siteConfig.timeZone;
	const at = new Date(s.from).getTime();
	const now = Date.now();
	const upcoming = isUpcoming(s, now);
	const canMove = upcoming && s.status === 'scheduled' && s.service.allowCustomerReschedule && at - s.service.rescheduleGap * 1000 > now;
	const canCancel = upcoming && s.status === 'scheduled' && s.service.allowCustomerCancel && at - s.service.cancelGap * 1000 > now;
	const kit = s.lines.filter((l) => l.shelf && l.slug).map((l) => l.slug).join(',');
	const event = { uid: s.id, title: `${s.service.title} · ${siteConfig.name}`, start: at, end: new Date(s.to).getTime(), location: s.shop ? [s.shop.title, ...s.shop.addressLines].join(', ') : undefined };

	const cancel = async () => {
		setBusy(true);
		setError(null);
		const res = await fetch(`/api/account/appointments/${s.id}/cancel`, { method: 'PUT' }).catch(() => null);
		setBusy(false);
		if (!res?.ok) {
			setError('We couldn’t cancel it online. Please call the shop.');
			return;
		}
		setMode('view');
		setNotice('Cancelled. We’ve emailed you a confirmation.');
		void refresh();
	};

	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
			<div>
				<Link href="/account" className="link text-sm text-ink-2">
					← All visits
				</Link>
				<h2 className="display mt-4 text-4xl leading-tight">
					{s.service.title}
					{s.service.option ? ` · ${s.service.option}` : ''}
				</h2>
				{notice ? (
					<p role="status" className="mt-4 border-l-2 border-green bg-paper-2 px-3 py-2 text-sm">
						{notice}
					</p>
				) : null}
				<dl className="mt-6 border-t border-paper-3">
					<Fact term="When">
						<span className="font-semibold">
							{longDate(at, tz)}, {timeLabel(at, tz)}
						</span>
						<span className="block text-sm text-ink-2">{sittingLength(s.service.duration)}</span>
					</Fact>
					<Fact term="Where">
						{s.shop?.title}
						<span className="block text-sm text-ink-2">{s.shop?.addressLines.join(', ')}</span>
					</Fact>
					<Fact term="Barber">{s.barber?.name ?? 'First free barber'}</Fact>
					<Fact term="Status">{s.status === 'canceled' ? 'Cancelled' : s.status === 'completed' ? 'Done' : s.status === 'pending' ? 'Awaiting confirmation' : 'Booked'}</Fact>
					{s.lines.length ? (
						<Fact term="Extras">
							{s.lines.map((l) => (
								<span key={l.id} className="block">
									{l.title}
									{l.quantity > 1 ? ` ×${l.quantity}` : ''}
									{l.shelf ? <span className="text-sm text-ink-3"> · at the chair</span> : null}
								</span>
							))}
						</Fact>
					) : null}
					{s.charge ? (
						<Fact term="Order">
							{s.charge.orderName} · {money(s.charge.orderTotal, s.charge.currency)}
							<span className="block text-sm text-ink-2">{s.charge.paymentStatus === 'paid' ? 'Paid' : s.charge.balance > 0 ? `${money(s.charge.balance, s.charge.currency)} to pay at the shop` : 'Unpaid'}</span>
						</Fact>
					) : null}
				</dl>
				<div className="mt-6 flex flex-wrap gap-2">
					{upcoming && s.status !== 'canceled' ? (
						<>
							<a href={icsHref([event])} download={ICS_FILENAME} className="btn btn-outline btn-sm">
								Add to calendar
							</a>
							<a href={googleCalendarHref(event)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
								Google Calendar
							</a>
							{s.shop ? (
								<a href={directionsHref(s.shop)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
									Directions
								</a>
							) : null}
						</>
					) : (
						<Link href={bookHref({ service: s.service.slug, barber: s.barber?.slug, shop: s.shop?.slug, kit: kit || undefined })} className="btn btn-primary">
							Book this again
						</Link>
					)}
				</div>
			</div>

			<div>
				{mode === 'move' ? (
					<ReschedulePanel
						s={s}
						onCancel={() => setMode('view')}
						onDone={() => {
							setMode('view');
							setNotice('Moved. We’ve emailed you the new time.');
							void refresh();
						}}
					/>
				) : upcoming && s.status !== 'canceled' ? (
					<div className="apoth p-5 sm:p-6">
						<h3 className="display text-2xl">Change of plan?</h3>
						<p className="mt-2 text-sm text-ink-2">
							Move or cancel free of charge
							{s.service.cancelGap ? ` up to ${gapLabel(s.service.cancelGap)} before` : ''}. After that, call the shop on {siteConfig.contact.phone}.
						</p>
						{mode === 'cancel' ? (
							<div className="mt-5 border-t border-paper-3 pt-5">
								<p className="font-semibold">Cancel this visit?</p>
								<p className="mt-1 text-sm text-ink-2">Anything from the shelf on it is cancelled too.</p>
								<div className="mt-4 flex flex-wrap gap-2">
									<button type="button" onClick={cancel} disabled={busy} className="btn border-oxblood bg-oxblood text-paper hover:bg-oxblood/90">
										{busy ? 'Cancelling…' : 'Yes, cancel it'}
									</button>
									<button type="button" onClick={() => setMode('view')} className="btn btn-outline">
										Keep it
									</button>
								</div>
							</div>
						) : (
							<div className="mt-5 flex flex-wrap gap-2">
								{canMove ? (
									<button type="button" onClick={() => setMode('move')} className="btn btn-primary">
										Move to another time
									</button>
								) : null}
								{canCancel ? (
									<button type="button" onClick={() => setMode('cancel')} className="btn btn-outline">
										Cancel visit
									</button>
								) : null}
								{!canMove && !canCancel ? <p className="text-sm text-ink-3">It’s too close to the time to change online.</p> : null}
							</div>
						)}
						{error ? (
							<p role="alert" className="mt-3 text-sm text-oxblood">
								{error}
							</p>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}
