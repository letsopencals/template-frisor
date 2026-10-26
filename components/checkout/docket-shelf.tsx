'use client';

import { money, pairsFor, type ShelfItem } from '@/lib/catalog';
import { flyToKit } from '@/lib/fly-to-kit';
import { shelfLines, useShelfDocket } from '@/hooks/use-shelf-docket';

/**
 * Docket part two, the shelf: what's already packed for you (with steppers), then "add to the
 * docket" suggestions that pair with the sitting. Prices, names and photos come from the store.
 */
export function DocketShelf({ shelf, currency }: { shelf: ShelfItem[]; currency: string }) {
	const d = useShelfDocket();
	const lines = shelfLines(d.items);
	const firstService = d.items[0]?.appointment?.product?.slug ?? null;
	const onIt = new Set(lines.map((l) => l.addOnId));
	const suggestions = pairsFor(firstService, shelf).filter((s) => !onIt.has(s.id) && d.targetFor(s)).slice(0, 4);

	return (
		<div>
			{lines.length ? (
				<ul className="space-y-3">
					{lines.map((l) => {
						const item = shelf.find((s) => s.id === l.addOnId);
						const max = item?.maxQuantity ?? 5;
						return (
							<li key={l.id} className="flex items-center gap-3">
								{item?.image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={item.image} alt="" className="h-12 w-12 object-cover" />
								) : null}
								<span className="min-w-0 flex-1">
									<span className="serif block leading-tight">{l.addOn?.title}</span>
									<span className="tabular text-xs text-ink-3">{money(l.originalUnitPrice, currency)} each</span>
								</span>
								<span className="flex items-center gap-1">
									<button type="button" disabled={d.busy === l.addOnId} onClick={() => d.setQuantity(l, l.quantity - 1)} className="h-8 w-8 border border-towel-3 hover:border-ink" aria-label={`One less ${l.addOn?.title}`}>
										−
									</button>
									<span className="sign tabular w-6 text-center text-lg font-bold">{l.quantity}</span>
									<button type="button" disabled={d.busy === l.addOnId || l.quantity >= max} onClick={() => d.setQuantity(l, l.quantity + 1)} className="h-8 w-8 border border-towel-3 hover:border-ink disabled:opacity-30" aria-label={`One more ${l.addOn?.title}`}>
										+
									</button>
								</span>
								<span className="serif tabular w-16 text-right">{money(l.originalSubtotal, currency)}</span>
							</li>
						);
					})}
				</ul>
			) : (
				<p className="text-sm text-ink-2">Nothing from the shelf yet. Your barber will be using these on you anyway:</p>
			)}

			{suggestions.length ? (
				<div className="mt-5">
					{lines.length ? <p className="label text-walnut">Add to the docket</p> : null}
					<ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
						{suggestions.map((s) => (
							<li key={s.id} data-shelf-card className="flex flex-col border border-towel-3 bg-towel/60">
								{s.image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={s.image} alt="" className="aspect-square w-full object-cover" loading="lazy" />
								) : null}
								<span className="flex flex-1 flex-col p-2">
									<span className="serif text-sm leading-tight">{s.title}</span>
									<span className="tabular mt-0.5 text-xs text-ink-3">{money(s.price, currency)}</span>
									<button
										type="button"
										disabled={d.busy === s.id}
										onClick={async (e) => {
											const img = e.currentTarget.closest('[data-shelf-card]')?.querySelector('img') ?? null;
											if (await d.add(s)) flyToKit(img, s.image);
										}}
										className="label mt-2 h-8 border border-ink text-[0.65rem] hover:bg-ink hover:text-towel disabled:opacity-40"
									>
										{d.busy === s.id ? 'Adding…' : '+ Add'}
									</button>
								</span>
							</li>
						))}
					</ul>
				</div>
			) : null}
			{d.error ? <p role="alert" className="mt-3 text-sm text-oxblood">{d.error}</p> : null}
		</div>
	);
}
