'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { Start } from '@/lib/slots';

const DAY_MS = 86_400_000;
const MAX_DAYS = 28;

/** YYYY-MM-DD → noon UTC that day (safe for weekday/day labels in any zone). */
const noon = (key: string) => Date.parse(`${key}T12:00:00Z`);
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts });
const WD = fmt({ weekday: 'short' });
const DN = fmt({ day: 'numeric' });
const MON = fmt({ month: 'short' });

/**
 * The days as one horizontal strip, directly above the times (DESIGN.md usability rules).
 * Every calendar day from the first free one to the last (max four weeks) so gaps read as
 * "closed / full" instead of disappearing. Days with no times are disabled.
 */
export function DateStrip({ days, value, onChange, today }: { days: Map<string, Start[]>; value: string | null; onChange: (d: string) => void; today: string }) {
	const keys = useMemo(() => {
		const free = [...days.keys()];
		if (!free.length) return [];
		const last = free[free.length - 1]!;
		const out: string[] = [];
		// From the first free day (or today), so a fully booked week doesn't push the strip off screen.
		const start = free[0]! > today ? free[0]! : today;
		for (let t = noon(start); out.length < MAX_DAYS; t += DAY_MS) {
			const k = new Date(t).toISOString().slice(0, 10);
			out.push(k);
			if (k >= last) break;
		}
		return out;
	}, [days, today]);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}, [value]);

	return (
		<div ref={ref} role="radiogroup" aria-label="Day" className="no-scrollbar -mx-4 flex snap-x scroll-px-4 sm:scroll-px-0 gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
			{keys.map((k) => {
				const n = days.get(k)?.length ?? 0;
				const t = noon(k);
				const isToday = k === today;
				return (
					<button key={k} type="button" role="radio" aria-checked={value === k} disabled={n === 0} onClick={() => onChange(k)} aria-label={`${fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(t)}${n ? `, ${n} times` : ', no times'}`} className="choice flex h-[76px] w-[58px] shrink-0 snap-start flex-col items-center justify-center gap-0.5">
						<span className="label text-[0.6rem] opacity-75">{isToday ? 'Today' : WD.format(t)}</span>
						<span className="display text-[1.55rem] leading-none">{DN.format(t)}</span>
						<span className="text-[0.62rem] opacity-60">{MON.format(t)}</span>
					</button>
				);
			})}
		</div>
	);
}
