'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useNextFree } from '@/hooks/use-next-free';
import { useInView } from '@/hooks/use-in-view';
import { useNow } from '@/hooks/use-now';
import { bookHref } from '@/lib/catalog';
import { shopState, shopStateLabel } from '@/lib/shop-hours';
import { siteConfig } from '@/lib/site-config';
import { nextFreeLabel } from '@/lib/when';

export interface ChairsShop {
	/** Shop (location) id. */
	locationId: string;
	/** The service probed for "next chair" (the everyday cut). */
	variantId: string;
	serviceSlug: string;
}

/**
 * "Chairs today": a board hanging in the window with each shop's next free chair for the
 * everyday cut. One cached request per shop (whole horizon), only once the board is visible.
 */
export function ChairsToday({
	shops,
	probe,
}: {
	shops: { id: string; slug: string; short: string; area: string; chairs: number; barbers: number }[];
	probe: ChairsShop[];
}) {
	const ref = useRef<HTMLDivElement>(null);
	const seen = useInView(ref, '0px');
	const now = useNow();
	const free = useNextFree(
		probe.map((p) => ({ variantId: p.variantId, locationId: p.locationId })),
		seen,
	);
	const state = now ? shopState(now) : null;

	return (
		<div ref={ref} className="chairs-board relative self-end p-5 sm:p-6">
			<div className="flex items-baseline justify-between gap-4 border-b border-towel/15 pb-3">
				<p className="board-letters text-lg text-towel">Chairs today</p>
				<p className="label text-brass-hi">{state ? shopStateLabel(state) : ' '}</p>
			</div>
			<ul>
				{shops.map((s, i) => {
					const p = probe.find((x) => x.locationId === s.id);
					const at = p && free ? free[`${p.variantId}:${p.locationId}`] : undefined;
					return (
						<li key={s.id} className="border-b border-towel/10 last:border-0">
							<Link href={bookHref({ shop: s.slug, service: p?.serviceSlug })} className="group flex items-center gap-4 py-3.5">
								<span className="enamel">{i + 1}</span>
								<span className="min-w-0 flex-1">
									<span className="board-letters block text-xl leading-none text-towel group-hover:text-brass-hi">{s.short}</span>
									<span className="mt-1 block text-xs text-steel">
										{s.area} · {s.barbers} barbers · {s.chairs} chairs
									</span>
								</span>
								<span className="text-right">
									<span className="label block text-steel-2">Next chair</span>
									<span className="board-letters tabular block text-lg text-brass-hi">
										{at === undefined ? <span className="pole pole--still inline-block h-1.5 w-12 opacity-60" aria-label="Checking" /> : at === null ? 'Full' : nextFreeLabel(at, siteConfig.timeZone, now?.getTime())}
									</span>
								</span>
							</Link>
						</li>
					);
				})}
			</ul>
			<p className="mt-3 text-[0.7rem] text-steel-2">For a Classic Cut. Every barber, every shop, live from the book.</p>
		</div>
	);
}
