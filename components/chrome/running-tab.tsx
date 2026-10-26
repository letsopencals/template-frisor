'use client';

import Link from 'next/link';
import { money } from '@/lib/catalog';
import type { Tab } from '@/lib/tab';

/**
 * The running tab: a paper chit clipped to the counter showing what's on the docket.
 * `data-kit-target` is where shelf products fly to when added (see `flyToKit`).
 */
export function RunningTab({ tab }: { tab: Tab | null }) {
	if (!tab) {
		return (
			<span data-kit-target className="label hidden h-10 items-center border border-dashed border-line px-3 text-steel-2 sm:inline-flex">
				Tab · empty
			</span>
		);
	}
	const parts = [`${tab.sittings} ${tab.sittings === 1 ? 'sitting' : 'sittings'}`];
	if (tab.shelfUnits > 0) parts.push(`${tab.shelfUnits} shelf`);
	return (
		<Link
			href="/checkout"
			data-kit-target
			className="paper flex h-10 items-center gap-3 px-3 text-ink shadow-[0_6px_16px_-8px_rgba(0,0,0,0.8)]"
			aria-label={`Your docket: ${parts.join(', ')}, ${money(tab.total, tab.currency)}`}
		>
			<span className="label hidden text-walnut sm:inline">Tab</span>
			<span className="hidden text-xs text-ink-2 md:inline">{parts.join(' · ')}</span>
			<span className="serif tabular text-base">{money(tab.total, tab.currency)}</span>
		</Link>
	);
}
