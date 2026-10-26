import Link from 'next/link';
import { bookHref, type Shop } from '@/lib/catalog';

/** A shop as a large photo panel with its address, the way there and two actions. */
export function ShopPanel({ shop, barberCount }: { shop: Shop; barberCount: number }) {
	return (
		<article className="flex flex-col">
			<Link href={`/shops/${shop.slug}`} className="photo-zoom block aspect-[4/3] overflow-hidden bg-green-2">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={shop.image} alt={`Frisør ${shop.short}`} loading="lazy" className="h-full w-full object-cover" />
			</Link>
			<div className="mt-4 flex items-baseline justify-between gap-3">
				<h3 className="display text-3xl">
					<Link href={`/shops/${shop.slug}`} className="hover:text-green">
						{shop.short}
					</Link>
				</h3>
				<span className="label text-[0.6rem] text-brass-lo">{shop.area}</span>
			</div>
			<p className="mt-1 text-sm text-ink-2">{shop.tagline}</p>
			<p className="mt-3 text-sm">{shop.addressLines.join(', ')}</p>
			<p className="text-xs text-ink-3">
				{shop.transit} · {barberCount} barbers · {shop.chairs} chairs
			</p>
			<div className="mt-4 flex gap-2">
				<Link href={bookHref({ shop: shop.slug })} className="btn btn-primary btn-sm">
					Book here
				</Link>
				<Link href={`/shops/${shop.slug}`} className="btn btn-outline btn-sm">
					The shop
				</Link>
			</div>
		</article>
	);
}
