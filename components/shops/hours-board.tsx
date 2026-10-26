'use client';

import { useNow } from '@/hooks/use-now';
import { shopState, shopStateLabel, weekRows } from '@/lib/shop-hours';
import { siteConfig } from '@/lib/site-config';

/** The opening hours as a felt letter board, today's row lit (Berlin time). */
export function HoursBoard() {
	const now = useNow();
	const today = now ? new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timeZone, weekday: 'long' }).format(now) : null;
	const state = now ? shopState(now) : null;
	return (
		<div className="board border-b-[10px] px-5 py-6">
			<div className="flex items-baseline justify-between gap-3">
				<p className="board-letters text-lg text-towel">Hours</p>
				<p className="label text-brass-hi">{state ? shopStateLabel(state) : ' '}</p>
			</div>
			<ul className="mt-4 space-y-1.5">
				{weekRows().map((r) => (
					<li key={r.day} className={r.day === today ? 'flex justify-between text-brass-hi' : 'flex justify-between text-towel/70'}>
						<span className="board-letters text-base">{r.day}</span>
						<span className="board-letters tabular text-base">{r.hours}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
