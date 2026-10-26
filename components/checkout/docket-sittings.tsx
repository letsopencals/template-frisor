'use client';

import type { CartItem } from '@opencals/storefront-sdk';
import { isShelfSlug, money, sittingLength } from '@/lib/catalog';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useCart } from '@/contexts/cart-context';
import { invalidateStudioAvailability } from '@/hooks/use-studio-availability';

/** Docket part one: each held sitting, written up the way the barber writes it on the chit. */
export function DocketSittings({ items, currency }: { items: CartItem[]; currency: string }) {
	const { removeItem } = useCart();
	const tz = siteConfig.timeZone;
	return (
		<ol className="space-y-6">
			{items.map((item, i) => {
				const a = item.appointment;
				if (!a) return null;
				const from = new Date(a.from).getTime();
				const extras = (item.addOnItems ?? []).filter((x) => !isShelfSlug(x.addOn?.slug));
				const option = a.product.variantTitle && a.product.variantTitle !== 'Default Title' ? a.product.variantTitle : null;
				return (
					<li key={item.id}>
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="label text-walnut">Sitting {items.length > 1 ? `No. ${i + 1}` : ''}</p>
								<p className="serif mt-1 text-2xl leading-tight">
									{a.product.title}
									{option ? <span className="text-ink-2"> · {option}</span> : null}
								</p>
								<p className="mt-1 text-sm text-ink-2">
									{longDate(from, tz)} at <span className="sign text-lg font-bold text-ink">{timeLabel(from, tz)}</span> · {sittingLength(a.product.duration)}
								</p>
								<p className="text-sm text-ink-2">
									{a.staffMember ? `with ${a.staffMember.firstName} ${a.staffMember.lastName ?? ''}`.trim() : 'First free barber'}
									{a.location?.title ? ` · ${a.location.title}` : ''}
								</p>
							</div>
							<span className="serif tabular shrink-0 text-xl">{money(item.originalUnitPrice, currency)}</span>
						</div>
						{extras.length ? (
							<ul className="mt-3 space-y-1 border-l-2 border-towel-3 pl-3 text-sm text-ink-2">
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
							className="label strop mt-3 text-[0.65rem] text-ink-3 hover:text-oxblood"
						>
							Release this chair
						</button>
					</li>
				);
			})}
		</ol>
	);
}
