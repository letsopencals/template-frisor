import Link from 'next/link';
import { bookHref, money, pairsFor, sittingLength, type ServiceGroup, type ShelfItem } from '@/lib/catalog';
import { Swivel } from '@/components/ui/swivel';

/**
 * One service on the full menu: the photo, what happens in the chair, each option as a paper
 * chit you can book straight from, and what from the shelf goes with it.
 */
export function ServiceGroupRow({ group, shelf, currency }: { group: ServiceGroup; shelf: ShelfItem[]; currency: string }) {
	const pairs = pairsFor(group.options[0]?.slug, shelf, 3);
	return (
		<Swivel as="article" className="grid gap-6 border-t border-line py-10 md:grid-cols-[minmax(0,15rem)_1fr] lg:gap-12">
			<div className="vignette relative aspect-[4/5] overflow-hidden border border-line bg-lacquer-2">
				{group.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={group.image} alt={group.title} className="h-full w-full object-cover" loading="lazy" />
				) : null}
			</div>
			<div>
				<h3 className="serif text-[clamp(1.9rem,3.4vw,2.6rem)] leading-tight text-towel">{group.title}</h3>
				{group.description ? <p className="mt-3 max-w-2xl leading-relaxed text-towel/75">{group.description}</p> : null}

				<ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{group.options.map((o) => (
						<li key={o.id}>
							<Link href={bookHref({ service: o.slug })} className="paper group flex h-full flex-col justify-between gap-4 p-4 transition-transform hover:-translate-y-0.5">
								<span>
									<span className="label block text-walnut">{o.option ?? 'The service'}</span>
									<span className="mt-1 block text-sm text-ink-2">{sittingLength(o.duration)}</span>
								</span>
								<span className="flex items-end justify-between gap-3">
									<span className="serif tabular text-2xl text-ink">{money(o.price, currency)}</span>
									<span className="label text-ink group-hover:text-walnut">Book →</span>
								</span>
							</Link>
						</li>
					))}
				</ul>

				{pairs.length ? (
					<div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-dashed border-line pt-4">
						<span className="label text-brass">Pairs with</span>
						{pairs.map((p) => (
							<Link key={p.id} href={bookHref({ service: group.options[0]?.slug, kit: p.slug })} className="group flex items-center gap-2 text-sm text-towel/80 hover:text-towel">
								{p.image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={p.image} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-brass/50" loading="lazy" />
								) : null}
								<span className="strop">{p.title}</span>
								<span className="tabular text-steel">{money(p.price, currency)}</span>
							</Link>
						))}
					</div>
				) : null}
			</div>
		</Swivel>
	);
}
