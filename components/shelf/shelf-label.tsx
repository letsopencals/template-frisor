'use client';

import clsx from 'clsx';
import { money, type ShelfItem } from '@/lib/catalog';
import { Stepper } from '@/components/ui/stepper';

/**
 * A shelf product as an apothecary label (DESIGN.md): photo, lot number, name, one-line benefit,
 * price and a one-tap Add that turns into a stepper. Used in booking, checkout and /shelf.
 */
export function ShelfLabel({
	item,
	lot,
	currency,
	quantity,
	onChange,
	busy = false,
	pairs = false,
	compact = false,
}: {
	item: ShelfItem;
	lot: number;
	currency: string;
	quantity: number;
	onChange: (n: number) => void;
	busy?: boolean;
	/** "Pairs with your service" ribbon. */
	pairs?: boolean;
	compact?: boolean;
}) {
	const benefit = item.note?.use ?? item.description;
	return (
		<article className={clsx('apoth flex h-full flex-col p-2.5', quantity > 0 && 'border-green outline-green/40')}>
			<div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
				{item.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
				) : null}
				{pairs ? <span className="label absolute left-0 top-0 bg-green px-2 py-1 text-[0.58rem] text-paper">Pairs well</span> : null}
			</div>
			<div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
				<p className="label text-[0.58rem] text-brass-lo">No. {String(lot).padStart(2, '0')}</p>
				<h3 className="serif mt-1 text-[1.02rem] leading-snug">{item.title}</h3>
				{!compact && benefit ? <p className="mt-1.5 line-clamp-2 text-[0.8rem] leading-snug text-ink-2">{benefit}</p> : null}
				<div className="mt-auto flex items-center justify-between gap-2 pt-3">
					<span className="display text-xl">{money(item.price, currency)}</span>
					{quantity > 0 ? (
						<Stepper value={quantity} onChange={onChange} max={item.maxQuantity ?? 9} busy={busy} label={item.title} tone="green" />
					) : (
						<button type="button" onClick={() => onChange(1)} disabled={busy} className="btn btn-outline btn-sm min-h-[44px]" aria-label={`Add ${item.title}`}>
							{busy ? 'Adding…' : 'Add'}
						</button>
					)}
				</div>
			</div>
		</article>
	);
}
