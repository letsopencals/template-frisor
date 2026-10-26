import Link from 'next/link';
import { bookHref, money, pairsFor, sittingLength, type ServiceGroup, type ShelfItem } from '@/lib/catalog';

/**
 * One service on the menu page: photo, name, description, each option as a priced line with its
 * own Book button, and "Pairs well with" from the shelf.
 */
export function ServiceRow({ group, shelf, currency }: { group: ServiceGroup; shelf: ShelfItem[]; currency: string }) {
	const pairs = pairsFor(group.options[0]?.slug, shelf, 2);
	return (
		<article id={group.options[0]?.slug} className="grid scroll-mt-[calc(var(--header-h)+16px)] gap-6 border-t border-paper-3 py-10 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr_260px] lg:gap-10">
			<div className="aspect-[4/3] overflow-hidden bg-paper-2 md:aspect-[4/5]">
				{group.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={group.image} alt="" loading="lazy" className="h-full w-full object-cover" />
				) : null}
			</div>
			<div>
				<h3 className="display text-3xl sm:text-4xl">{group.title}</h3>
				{group.description ? <p className="mt-3 max-w-xl leading-relaxed text-ink-2">{group.description}</p> : null}
				<ul className="mt-5 max-w-xl">
					{group.options.map((o) => (
						<li key={o.id} className="flex items-center gap-4 border-b border-dotted border-ink-3/50 py-3">
							<span className="min-w-0 flex-1">
								<span className="block font-semibold">{o.option ?? group.title}</span>
								<span className="text-sm text-ink-3">{sittingLength(o.duration)}</span>
							</span>
							<span className="tabular text-lg">{money(o.price, currency)}</span>
							<Link href={bookHref({ service: o.slug })} className="btn btn-primary btn-sm" aria-label={`Book ${o.name}`}>
								Book
							</Link>
						</li>
					))}
				</ul>
			</div>
			{pairs.length ? (
				<aside className="md:col-span-2 lg:col-span-1" aria-label="Pairs well with">
					<p className="label text-[0.62rem] text-brass-lo">Pairs well with</p>
					<ul className="mt-3 space-y-2">
						{pairs.map((p) => (
							<li key={p.id}>
								<Link href={bookHref({ service: group.options[0]?.slug, kit: p.slug })} className="apoth group flex items-center gap-3 p-2 hover:border-green">
									{p.image ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={p.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 object-cover" />
									) : null}
									<span className="min-w-0">
										<span className="serif block truncate text-[0.95rem] group-hover:text-green">{p.title}</span>
										<span className="tabular text-xs text-ink-3">
											{money(p.price, currency)} · book with it →
										</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				</aside>
			) : null}
		</article>
	);
}
