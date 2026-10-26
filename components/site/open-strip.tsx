'use client';

import Link from 'next/link';
import { useNow } from '@/hooks/use-now';
import { shopState, shopStateLabel } from '@/lib/shop-hours';
import { siteConfig } from '@/lib/site-config';

/** The slim green strip over the header: whether the shops are open right now (Berlin time). */
export function OpenStrip({ shops }: { shops: { slug: string; short: string }[] }) {
	const now = useNow();
	const state = now ? shopState(now) : null;
	return (
		<div className="h-7 bg-green-2 text-paper lg:h-8">
			<div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 text-[0.72rem] sm:px-6 lg:px-10">
				<p className="flex min-w-0 items-center gap-2 truncate">
					<span className={state?.kind === 'open' ? 'h-1.5 w-1.5 shrink-0 bg-brass-hi' : 'h-1.5 w-1.5 shrink-0 bg-paper/40'} aria-hidden />
					<span className="truncate">
						{state ? shopStateLabel(state) : siteConfig.contact.hours}
						<span className="hidden text-paper/60 sm:inline"> · {shops.map((s) => s.short).join(', ')}</span>
					</span>
				</p>
				<Link href="/shelf" className="hidden shrink-0 text-brass-hi hover:text-paper md:block">
					15% off the shelf with any booking
				</Link>
			</div>
		</div>
	);
}
