'use client';

import type { Barber } from '@/lib/catalog';
import { dayLabel } from '@/lib/when';
import { useHydrated } from '@/hooks/use-hydrated';

/** Barber portraits in one row, "Any available" first. Scrolls sideways on phones. */
export function BarberRow({ barbers, value, onChange, nextBy, timeZone, loading }: { loading: boolean; barbers: Barber[]; value: string | 'any'; onChange: (id: string | 'any') => void; nextBy: Record<string, number>; timeZone: string }) {
	const hydrated = useHydrated();
	return (
		<div role="radiogroup" aria-label="Barber" className="no-scrollbar -mx-4 flex snap-x scroll-px-4 sm:scroll-px-0 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
			<button type="button" role="radio" aria-checked={value === 'any'} onClick={() => onChange('any')} className="choice flex w-[96px] sm:w-[104px] shrink-0 snap-start flex-col items-start p-2 text-left">
				<span className="flex aspect-square w-full items-center justify-center bg-paper-2 text-ink-2 [[aria-checked=true]_&]:bg-green-hi [[aria-checked=true]_&]:text-paper">
					<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden>
						<circle cx="14" cy="15" r="5" />
						<circle cx="27" cy="15" r="5" />
						<path d="M5 32c1.5-5 5-7 9-7s7.5 2 9 7M19 29c1.4-2.7 4.3-4 8-4 4 0 7.5 2 9 7" />
					</svg>
				</span>
				<span className="mt-2 block text-[0.9rem] font-semibold leading-tight">Any barber</span>
				<span className="block text-[0.72rem] opacity-70">Most times</span>
			</button>
			{barbers.map((b) => {
				const next = nextBy[b.id];
				return (
					<button key={b.id} type="button" role="radio" aria-checked={value === b.id} onClick={() => onChange(b.id)} className="choice flex w-[96px] sm:w-[104px] shrink-0 snap-start flex-col items-start p-2 text-left">
						<span className="block aspect-square w-full overflow-hidden bg-paper-2">
							{b.imageUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={b.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
							) : null}
						</span>
						<span className="mt-2 block truncate text-[0.9rem] font-semibold leading-tight">{b.firstName}</span>
						<span className="block truncate text-[0.72rem] opacity-70">{loading || !hydrated ? '\u00a0' : next ? `Free ${dayLabel(next, timeZone)}` : 'No times soon'}</span>
					</button>
				);
			})}
		</div>
	);
}
