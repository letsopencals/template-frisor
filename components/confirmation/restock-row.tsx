import Link from 'next/link';
import { bookHref, money, pairsFor, type ShelfItem } from '@/lib/catalog';

/**
 * "Restock at your next visit": three shelf products that pair with the service (what was just
 * bought first, for the restock), each linking into a booking with it already in the kit.
 */
export function RestockRow({ service, bought, shelf, currency, next, title = 'Restock at your next visit' }: { service: string; bought: string[]; shelf: ShelfItem[]; currency: string; next: { service?: string; barber?: string; shop?: string }; title?: string }) {
	const boughtItems = bought.map((slug) => shelf.find((s) => s.slug === slug)).filter((s): s is ShelfItem => !!s);
	const rest = pairsFor(service, shelf).filter((s) => !bought.includes(s.slug));
	const items = [...boughtItems, ...rest].slice(0, 3);
	if (!items.length) return null;
	return (
		<section aria-label={title}>
			<div className="flex flex-wrap items-baseline justify-between gap-3">
				<h2 className="display text-3xl">{title}</h2>
				<Link href="/shelf" className="link text-sm text-ink-2">
					The whole shelf
				</Link>
			</div>
			<p className="mt-1 text-sm text-ink-2">Add it to your next booking and it’s waiting at the chair, 15% off.</p>
			<ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
				{items.map((s) => (
					<li key={s.id} className="apoth flex gap-3 p-2.5 sm:flex-col">
						{s.image ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={s.image} alt="" loading="lazy" className="h-24 w-24 shrink-0 object-cover sm:aspect-[4/3] sm:h-auto sm:w-full" />
						) : null}
						<div className="flex min-w-0 flex-1 flex-col sm:px-1.5 sm:pb-1">
							<p className="serif leading-snug">{s.title}</p>
							<p className="tabular text-sm text-ink-3">{money(s.price, currency)}</p>
							<Link href={bookHref({ ...next, kit: s.slug })} className="link mt-auto pt-2 text-sm font-semibold text-green">
								{bought.includes(s.slug) ? 'Restock next time →' : 'Add to next visit →'}
							</Link>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
