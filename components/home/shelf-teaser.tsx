import Link from 'next/link';
import { bookHref, money, type ShelfItem } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { GuardSign } from '@/components/ui/guard-sign';
import { TagLink } from '@/components/ui/tag';

/**
 * The apothecary wall on the home page: the shelf photo, then one plank of products with
 * swing tags. Each product links to a booking with it already in the kit.
 */
export function ShelfTeaser({ shelf, currency }: { shelf: ShelfItem[]; currency: string }) {
	const plank = shelf.slice(0, 6);
	return (
		<section className="relative overflow-hidden py-24 lg:py-32">
			<div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
				<div>
					<GuardSign guard={siteConfig.guards[3]!} title="The shelf" line="Everything on it is what we use at the chair. Add it to your booking and it's packed and waiting at your station when you sit down." />
					<ul className="mt-8 space-y-2 text-sm text-towel/85">
						<li className="flex gap-3">
							<span className="text-brass">—</span>
							{siteConfig.shelf.autoCodeLabel}
						</li>
						<li className="flex gap-3">
							<span className="text-brass">—</span>
							Pay with your sitting. Swap it at the till if it isn&rsquo;t right.
						</li>
					</ul>
					<div className="mt-9 flex flex-wrap gap-4">
						<TagLink href="/apothecary">Browse the shelf</TagLink>
						<TagLink href="/book" variant="line">
							Book &amp; add a kit
						</TagLink>
					</div>
				</div>
				<div className="vignette relative aspect-[16/10] overflow-hidden border border-line">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={siteConfig.shelf.wall} alt="The apothecary wall at Frisør Mitte" className="h-full w-full object-cover" loading="lazy" />
				</div>
			</div>

			<div className="mx-auto mt-20 max-w-[1600px] px-5 sm:px-8">
				<ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
					{plank.map((item) => (
						<li key={item.id}>
							<Link href={bookHref({ kit: item.slug })} className="group block">
								<div className="relative aspect-square overflow-hidden bg-lacquer-2">
									{item.image ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
									) : null}
								</div>
								<div className="plank" aria-hidden />
								<div className="swing-tag paper mt-4 py-2 pr-3">
									<span className="serif block text-[0.95rem] leading-tight">{item.title}</span>
									<span className="tabular mt-0.5 block text-sm text-walnut">{money(item.price, currency)}</span>
								</div>
								{item.note?.facts?.length ? <p className="mt-2 text-xs text-steel">{item.note.facts.join(' · ')}</p> : null}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
