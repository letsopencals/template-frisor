'use client';

import clsx from 'clsx';
import type { Start } from '@/lib/slots';
import { localMinutes, timeLabel } from '@/lib/when';

const PARTS = [
	{ key: 'morning', label: 'Morning', test: (m: number) => m < 720 },
	{ key: 'afternoon', label: 'Afternoon', test: (m: number) => m >= 720 && m < 1020 },
	{ key: 'evening', label: 'After work', test: (m: number) => m >= 1020 },
];

/** The accessible time picker under the dial: every free start of the day, by part of day. */
export function TimeList({ starts, value, onPick, timeZone }: { starts: Start[]; value: number | null; onPick: (at: number) => void; timeZone: string }) {
	if (!starts.length) return <p className="text-sm text-steel">No free chairs this day. Try another tag, or another barber.</p>;
	return (
		<div className="space-y-4" role="radiogroup" aria-label="Time">
			{PARTS.map((p) => {
				const list = starts.filter((s) => p.test(localMinutes(s.at, timeZone)));
				if (!list.length) return null;
				return (
					<div key={p.key}>
						<p className="label text-steel-2">{p.label}</p>
						<ul className="mt-2 flex flex-wrap gap-1.5">
							{list.map((s) => {
								const on = s.at === value;
								return (
									<li key={s.at}>
										<button
											type="button"
											role="radio"
											aria-checked={on}
											onClick={() => onPick(s.at)}
											className={clsx('sign tabular h-10 min-w-[4.25rem] border px-3 text-lg font-bold transition-colors', on ? 'border-brass-hi bg-brass text-ink' : 'border-line text-towel hover:border-brass')}
										>
											{timeLabel(s.at, timeZone)}
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
		</div>
	);
}
