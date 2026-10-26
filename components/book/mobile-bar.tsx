'use client';

import { useState } from 'react';
import { money } from '@/lib/catalog';
import { timeLabel, dayLabel } from '@/lib/when';
import { useHydrated } from '@/hooks/use-hydrated';
import type { ChairBooking } from '@/hooks/use-chair-booking';
import { ChairSummary, chairLines, type BookStep, type PrimaryAction } from '@/components/book/chair-summary';

/**
 * Phones: "Your chair" as a bar fixed to the bottom of /book, with the running total and the
 * step's primary action always in reach. Tapping the summary opens the full panel as a sheet.
 */
export function MobileBar({ b, currency, primary, onEdit }: { b: ChairBooking; currency: string; primary: PrimaryAction; onEdit: (s: BookStep) => void }) {
	const [open, setOpen] = useState(false);
	const hydrated = useHydrated();
	const { total } = chairLines(b);
	const at = b.selected?.at ?? null;
	const line = b.service ? `${b.service.option ?? b.service.groupTitle}${at && hydrated ? ` · ${dayLabel(at, b.timeZone)} ${timeLabel(at, b.timeZone)}` : ''}` : 'Choose a service';

	return (
		<>
			{open ? (
				<div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
			) : null}
			<div className="fixed inset-x-0 bottom-0 z-40 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
				{open ? (
					<div className="fade-in max-h-[70svh] overflow-y-auto border-t border-paper-3 bg-paper px-4 pb-2 pt-4">
						<ChairSummary
							b={b}
							currency={currency}
							primary={primary}
							hideAction
							onEdit={(s) => {
								setOpen(false);
								onEdit(s);
							}}
						/>
					</div>
				) : null}
				<div className="flex items-center gap-3 border-t border-paper-3 bg-paper px-4 py-2.5 shadow-[0_-8px_24px_-12px_rgba(23,32,28,0.25)]">
					<button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-[44px] min-w-0 flex-1 flex-col items-start justify-center text-left">
						<span className="flex w-full items-baseline gap-2">
							<span className="display text-xl leading-none">{money(total, currency)}</span>
							<span className="text-[0.7rem] text-ink-3">{open ? 'Hide' : 'Details'} {open ? '▾' : '▴'}</span>
						</span>
						<span className="block w-full truncate text-xs text-ink-2">{line}</span>
					</button>
					<button type="button" onClick={primary.onClick} disabled={primary.disabled || primary.busy} className="btn btn-primary shrink-0 px-4">
						{primary.busy ? 'Holding…' : (primary.short ?? primary.label)}
					</button>
				</div>
			</div>
		</>
	);
}
