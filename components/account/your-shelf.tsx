import Link from 'next/link';
import type { Sitting } from '@/lib/sittings';
import { bookHref, money, pairsFor, type ShelfItem } from '@/lib/catalog';

/**
 * "Your shelf": what you've taken home before (restock), else what pairs with your usual
 * service. Each links into a booking with the product already in the kit.
 */
export function YourShelf({ sittings, shelf, currency }: { sittings: Sitting[]; shelf: ShelfItem[]; currency: string }) {
	const last = sittings.find((s) => s.status !== 'canceled') ?? null;
	const bought = [...new Set(sittings.flatMap((s) => s.lines.filter((l) => l.shelf && l.slug).map((l) => l.slug!)))];
	const mine = bought.map((slug) => shelf.find((s) => s.slug === slug)).filter((s): s is ShelfItem => !!s);
	const items = (mine.length ? mine : pairsFor(last?.service.slug, shelf, 3)).slice(0, 4);
	if (!items.length) return null;
	const next = { service: last?.service.slug, barber: last?.barber?.slug, shop: last?.shop?.slug };
	return (
		<section aria-label="Your shelf" className="mt-14">
			<div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper-3 pb-3">
				<h2 className="display text-3xl">{mine.length ? 'Your shelf' : 'For your next visit'}</h2>
				{mine.length > 1 ? (
					<Link href={bookHref({ ...next, kit: mine.map((m) => m.slug).join(',') })} className="link text-sm font-semibold text-green">
						Restock everything with your next booking →
					</Link>
				) : null}
			</div>
			<p className="mt-3 text-sm text-ink-2">{mine.length ? 'What you’ve taken home before. Add it to your next booking and it’s waiting at the chair, 15% off.' : 'What your barber uses on your usual service.'}</p>
			<ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
				{items.map((s) => (
					<li key={s.id} className="apoth flex flex-col p-2.5">
						{s.image ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={s.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
						) : null}
						<p className="serif mt-3 px-1 text-[0.98rem] leading-snug">{s.title}</p>
						<p className="tabular px-1 text-sm text-ink-3">{money(s.price, currency)}</p>
						<Link href={bookHref({ ...next, kit: s.slug })} className="link mt-auto px-1 pb-1 pt-2 text-sm font-semibold text-green">
							{mine.length ? 'Restock →' : 'Add to next visit →'}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
