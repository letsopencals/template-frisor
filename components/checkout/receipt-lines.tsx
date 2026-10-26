'use client';

import type { CartItem } from '@opencals/storefront-sdk';
import { isShelfSlug, money, pairsFor, sittingLength, type ShelfItem } from '@/lib/catalog';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useCart } from '@/contexts/cart-context';
import { shelfLines, useShelfDocket } from '@/hooks/use-shelf-docket';
import { invalidateStudioAvailability } from '@/hooks/use-studio-availability';
import { Stepper } from '@/components/ui/stepper';

/** Each held appointment, with its in-chair extras, the way the receipt prints it. */
export function SittingLines({ items, currency }: { items: CartItem[]; currency: string }) {
	const { removeItem } = useCart();
	const tz = siteConfig.timeZone;
	return (
		<ul className="divide-y divide-paper-3">
			{items.map((item) => {
				const a = item.appointment;
				if (!a) return null;
				const from = new Date(a.from).getTime();
				const option = a.product.variantTitle && a.product.variantTitle !== 'Default Title' ? a.product.variantTitle : null;
				const extras = (item.addOnItems ?? []).filter((x) => !isShelfSlug(x.addOn?.slug));
				return (
					<li key={item.id} className="py-4 first:pt-0">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="serif text-[1.08rem] leading-snug">
									{a.product.title}
									{option ? ` · ${option}` : ''}
								</p>
								<p className="mt-1 text-sm text-ink-2">
									{longDate(from, tz)}, <span className="font-semibold text-ink">{timeLabel(from, tz)}</span> · {sittingLength(a.product.duration)}
								</p>
								<p className="text-sm text-ink-2">
									{a.staffMember ? `With ${a.staffMember.firstName}` : 'First free barber'}
									{a.location?.title ? ` · ${a.location.title}` : ''}
								</p>
							</div>
							<span className="tabular shrink-0">{money(item.originalUnitPrice, currency)}</span>
						</div>
						{extras.length ? (
							<ul className="mt-2 space-y-1 text-sm text-ink-2">
								{extras.map((x) => (
									<li key={x.id} className="flex justify-between gap-3">
										<span>+ {x.addOn?.title}</span>
										<span className="tabular">{money(x.originalSubtotal, currency)}</span>
									</li>
								))}
							</ul>
						) : null}
						<button
							type="button"
							onClick={async () => {
								await removeItem(item.id);
								invalidateStudioAvailability();
							}}
							className="link mt-2 text-xs text-ink-3 hover:text-oxblood"
						>
							Remove
						</button>
					</li>
				);
			})}
		</ul>
	);
}

/** Shelf products on the order, with steppers, then a last-chance row of two that pair well. */
export function ShelfLines({ shelf, currency }: { shelf: ShelfItem[]; currency: string }) {
	const d = useShelfDocket();
	const lines = shelfLines(d.items);
	const onIt = new Set(lines.map((l) => l.addOnId));
	const firstService = d.items[0]?.appointment?.product?.slug ?? null;
	const suggestions = pairsFor(firstService, shelf)
		.filter((s) => !onIt.has(s.id) && d.targetFor(s))
		.slice(0, 2);

	return (
		<div>
			{lines.length ? (
				<ul className="space-y-3">
					{lines.map((l) => {
						const item = shelf.find((s) => s.id === l.addOnId);
						return (
							<li key={l.id} className="flex items-center gap-3">
								{item?.image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={item.image} alt="" className="h-14 w-14 shrink-0 object-cover" />
								) : null}
								<span className="min-w-0 flex-1">
									<span className="serif block truncate leading-tight">{l.addOn?.title}</span>
									<span className="tabular text-xs text-ink-3">{money(l.originalSubtotal, currency)}</span>
								</span>
								<Stepper value={l.quantity} onChange={(n) => d.setQuantity(l, n)} max={item?.maxQuantity ?? 9} busy={d.busy === l.addOnId} label={l.addOn?.title ?? 'item'} />
							</li>
						);
					})}
				</ul>
			) : null}

			{suggestions.length ? (
				<div className={lines.length ? 'mt-5' : ''}>
					<p className="label text-[0.62rem] text-brass-lo">{lines.length ? 'Pairs well, too' : 'Last call from the shelf · 15% off'}</p>
					<ul className="mt-2 space-y-2">
						{suggestions.map((s) => (
							<li key={s.id} className="flex items-center gap-3 border border-dashed border-paper-3 p-2">
								{s.image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={s.image} alt="" className="h-12 w-12 shrink-0 object-cover" loading="lazy" />
								) : null}
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-semibold">{s.title}</span>
									<span className="tabular text-xs text-ink-3">{money(s.price, currency)}</span>
								</span>
								<button type="button" disabled={d.busy === s.id} onClick={() => void d.add(s)} className="btn btn-outline btn-sm min-h-[40px]">
									{d.busy === s.id ? 'Adding…' : 'Add'}
								</button>
							</li>
						))}
					</ul>
				</div>
			) : null}
			{d.error ? (
				<p role="alert" className="mt-2 text-sm text-oxblood">
					{d.error}
				</p>
			) : null}
		</div>
	);
}
