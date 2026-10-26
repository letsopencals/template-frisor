import Link from 'next/link';
import { money, type ShelfItem } from '@/lib/catalog';

/** A shelf product as a static apothecary label linking to the shelf (home, barber pages). */
export function ShelfTile({ item, lot, currency, href = '/shelf' }: { item: ShelfItem; lot: number; currency: string; href?: string }) {
	return (
		<Link href={href} className="apoth photo-zoom group flex h-full flex-col p-2.5">
			<div className="aspect-square overflow-hidden bg-paper-2">
				{item.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
				) : null}
			</div>
			<div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
				<p className="label text-[0.58rem] text-brass-lo">No. {String(lot).padStart(2, '0')}</p>
				<p className="serif mt-1 text-[1.02rem] leading-snug group-hover:text-green">{item.title}</p>
				{item.note?.facts?.length ? <p className="mt-1 text-xs text-ink-3">{item.note.facts.join(' · ')}</p> : null}
				<p className="display mt-auto pt-3 text-xl">{money(item.price, currency)}</p>
			</div>
		</Link>
	);
}
