'use client';

import { useNow } from '@/hooks/use-now';
import { shopState, shopStateLabel } from '@/lib/shop-hours';
import { siteConfig } from '@/lib/site-config';

/**
 * The thin enamel sign across the top of every page (there is no top header: navigation is the
 * Counter bar at the bottom). Shows whether the shops are open, in Berlin time.
 */
export function EnamelSign({ shops }: { shops: string[] }) {
	const now = useNow();
	const state = now ? shopState(now) : null;
	return (
		<div className="border-b border-ink/20 bg-towel text-ink">
			<div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between gap-4 px-4 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] sm:px-8">
				<span className="truncate">{siteConfig.tagline}</span>
				<span className="hidden truncate text-ink-2 md:inline">{shops.join(' · ')}</span>
				<span className="flex shrink-0 items-center gap-2" aria-live="polite">
					<span
						aria-hidden
						className={state?.kind === 'open' ? 'lamp inline-block h-2 w-2 rounded-full bg-[#2f7d4f]' : 'inline-block h-2 w-2 rounded-full bg-oxblood'}
					/>
					{state ? shopStateLabel(state) : siteConfig.contact.hours.split('·')[0]}
				</span>
			</div>
		</div>
	);
}
