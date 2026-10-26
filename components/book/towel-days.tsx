'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import type { Start } from '@/lib/slots';

/**
 * The day picker as towel tags hung on a rail: the next 14 days, each with how many chairs
 * are free. Closed or full days hang greyed out. The chosen tag drops lower, brass-stitched.
 */
export function TowelDays({ days, value, onChange, timeZone }: { days: Map<string, Start[]>; value: string | null; onChange: (day: string) => void; timeZone: string }) {
	const rail = useRef<HTMLUListElement>(null);
	useEffect(() => {
		const ul = rail.current;
		const el = ul?.querySelector<HTMLElement>('[aria-checked="true"]');
		if (ul && el) ul.scrollTo({ left: Math.max(0, el.offsetLeft - ul.clientWidth / 2 + el.clientWidth / 2), behavior: 'smooth' });
	}, [value]);
	const first = days.keys().next().value as string | undefined;
	const today = new Intl.DateTimeFormat('en-CA', { timeZone }).format(Date.now());
	const base = new Date(`${first && first < today ? first : today}T12:00:00Z`);
	const list = Array.from({ length: 14 }, (_, i) => {
		const d = new Date(base.getTime() + i * 86_400_000);
		return d.toISOString().slice(0, 10);
	});
	const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...o }).format(new Date(`${iso}T12:00:00Z`));

	return (
		<div className="relative">
			<div aria-hidden className="absolute inset-x-0 top-2 h-[3px] bg-gradient-to-b from-brass-hi to-brass-lo shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
			<ul ref={rail} className="relative flex gap-2 overflow-x-auto px-1 pb-4 pt-0" role="radiogroup" aria-label="Day">
				{list.map((iso) => {
					const count = days.get(iso)?.length ?? 0;
					const on = iso === value;
					return (
						<li key={iso} className="shrink-0">
							<button
								type="button"
								role="radio"
								aria-checked={on}
								disabled={!count}
								onClick={() => onChange(iso)}
								className={clsx('towel-tag flex w-[4.4rem] flex-col items-center pb-3 pt-5 transition-transform duration-300', on ? 'translate-y-3 is-on' : 'hover:translate-y-1', !count && 'opacity-35')}
							>
								<span className="label text-[0.6rem]">{iso === today ? 'Today' : fmt(iso, { weekday: 'short' })}</span>
								<span className="sign mt-1 text-3xl font-black leading-none">{fmt(iso, { day: 'numeric' })}</span>
								<span className="mt-1 text-[0.65rem]">{fmt(iso, { month: 'short' })}</span>
								<span className="mt-1.5 text-[0.65rem] font-semibold">{count ? `${count} free` : 'Full'}</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
