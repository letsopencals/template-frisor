'use client';

import type { Start } from '@/lib/slots';
import { localMinutes, timeLabel } from '@/lib/when';

const PARTS = [
	{ key: 'morning', label: 'Morning', test: (m: number) => m < 12 * 60 },
	{ key: 'afternoon', label: 'Afternoon', test: (m: number) => m >= 12 * 60 && m < 17 * 60 },
	{ key: 'evening', label: 'Evening', test: (m: number) => m >= 17 * 60 },
] as const;

/** The day's free times as plain buttons, grouped Morning / Afternoon / Evening. */
export function SlotGrid({ starts, value, onPick, timeZone }: { starts: Start[]; value: number | null; onPick: (at: number) => void; timeZone: string }) {
	const groups = PARTS.map((p) => ({ ...p, starts: starts.filter((s) => p.test(localMinutes(s.at, timeZone))) })).filter((g) => g.starts.length);
	return (
		<div className="space-y-5">
			{groups.map((g) => (
				<div key={g.key} role="radiogroup" aria-label={g.label}>
					<p className="label flex items-baseline gap-2 text-ink-2">
						{g.label}
						<span className="font-medium normal-case tracking-normal text-ink-3">{g.starts.length} free</span>
					</p>
					<div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 xl:grid-cols-8">
						{g.starts.map((s) => (
							<button key={s.at} type="button" role="radio" aria-checked={value === s.at} onClick={() => onPick(s.at)} className="choice tabular h-12 text-[0.95rem] font-semibold">
								{timeLabel(s.at, timeZone)}
							</button>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
