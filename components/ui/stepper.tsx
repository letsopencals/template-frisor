'use client';

import clsx from 'clsx';

/** − n + quantity control. `onChange(0)` removes. */
export function Stepper({ value, onChange, max = 9, busy = false, label, tone = 'paper', className }: { value: number; onChange: (n: number) => void; max?: number; busy?: boolean; label: string; tone?: 'paper' | 'green'; className?: string }) {
	const btn = clsx('flex h-11 w-11 items-center justify-center text-lg transition-colors disabled:opacity-30', tone === 'green' ? 'hover:bg-green-hi' : 'hover:bg-paper-2');
	return (
		<div className={clsx('inline-flex items-center border', tone === 'green' ? 'border-green bg-green text-paper' : 'border-paper-3 bg-[#fbf8f2] text-ink', className)}>
			<button type="button" className={btn} disabled={busy} onClick={() => onChange(value - 1)} aria-label={value === 1 ? `Remove ${label}` : `One less ${label}`}>
				−
			</button>
			<span className="tabular w-6 text-center text-sm font-bold" aria-live="polite">
				{value}
			</span>
			<button type="button" className={btn} disabled={busy || value >= max} onClick={() => onChange(value + 1)} aria-label={`One more ${label}`}>
				+
			</button>
		</div>
	);
}
