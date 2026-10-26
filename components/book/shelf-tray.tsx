'use client';

import clsx from 'clsx';
import { money } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { flyToKit } from '@/lib/fly-to-kit';
import type { ChairBooking } from '@/hooks/use-chair-booking';

/**
 * The Shelf step beside the mirror: what goes with this service (the configured pairs first),
 * each with a stepper, plus the in-chair extras. Shelf products are packed at the station.
 */
export function ShelfTray({ b, currency }: { b: ChairBooking; currency: string }) {
	const pairs = (b.service && siteConfig.shelf.pairs[b.service.slug]) || [];
	const shelf = [...b.shelfOffered].sort((x, y) => (pairs.indexOf(x.slug) + 1 || 99) - (pairs.indexOf(y.slug) + 1 || 99));
	const { selectedAddOns, updateQuantity, addOnsLoading } = b.addOns;

	return (
		<div className="space-y-8">
			<div>
				<div className="flex items-baseline justify-between gap-3">
					<p className="label text-brass">4 · The shelf</p>
					{siteConfig.shelf.autoCode ? <p className="text-[0.7rem] text-brass-hi">{siteConfig.shelf.autoCodeLabel}</p> : null}
				</div>
				<p className="mt-2 text-sm text-towel/70">Packed and waiting at your station. {b.barber ? `${b.barber.firstName} finishes with it.` : 'Your barber finishes with it.'}</p>
				{addOnsLoading && !shelf.length ? <div className="pole mt-4 h-1.5 w-24" aria-label="Loading the shelf" /> : null}
				<ul className="mt-4 space-y-2">
					{shelf.map((a, i) => {
						const qty = selectedAddOns.get(a.id) ?? 0;
						const max = a.maxQuantity ?? 5;
						const pick = i < pairs.length && pairs.includes(a.slug);
						return (
							<li key={a.id} data-shelf-card className={clsx('flex items-center gap-3 border p-2 transition-colors', qty ? 'border-brass bg-felt' : 'border-line')}>
								{a.image?.url ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={a.image.url} alt="" className="h-14 w-14 shrink-0 object-cover" loading="lazy" />
								) : (
									<span className="h-14 w-14 shrink-0 bg-lacquer-2" />
								)}
								<span className="min-w-0 flex-1">
									{pick ? <span className="label block text-[0.6rem] text-brass">Pairs with this</span> : null}
									<span className="serif block truncate text-[0.95rem] leading-tight text-towel">{a.title}</span>
									<span className="tabular text-xs text-steel">{money(a.price, currency)}</span>
								</span>
								{qty ? (
									<span className="flex items-center gap-1">
										<button type="button" onClick={() => updateQuantity(a.id, qty - 1)} className="h-8 w-8 border border-line text-towel hover:border-brass" aria-label={`One less ${a.title}`}>
											−
										</button>
										<span className="sign tabular w-6 text-center text-lg font-bold text-brass-hi" aria-live="polite">{qty}</span>
										<button type="button" disabled={qty >= max} onClick={() => updateQuantity(a.id, qty + 1)} className="h-8 w-8 border border-line text-towel hover:border-brass disabled:opacity-30" aria-label={`One more ${a.title}`}>
											+
										</button>
									</span>
								) : (
									<button
										type="button"
										onClick={(e) => {
											updateQuantity(a.id, 1);
											flyToKit(e.currentTarget.closest('[data-shelf-card]')?.querySelector('img') ?? null, a.image?.url ?? null);
										}}
										className="label h-8 border border-brass/60 px-3 text-brass-hi hover:bg-brass hover:text-ink"
									>
										Add
									</button>
								)}
							</li>
						);
					})}
				</ul>
			</div>

			{b.extrasOffered.length ? (
				<div>
					<p className="label text-brass">In the same sitting</p>
					<ul className="mt-3 space-y-1.5">
						{b.extrasOffered.map((a) => {
							const on = (selectedAddOns.get(a.id) ?? 0) > 0;
							return (
								<li key={a.id}>
									<label className="flex cursor-pointer items-center gap-3 py-1 text-sm text-towel/85">
										<input type="checkbox" checked={on} onChange={(e) => updateQuantity(a.id, e.target.checked ? 1 : 0)} className="h-4 w-4 accent-[#c49a58]" />
										<span className="flex-1">{a.title}</span>
										<span className="tabular text-steel">+{money(a.price, currency)}</span>
									</label>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</div>
	);
}
