'use client';

import { memo } from 'react';
import clsx from 'clsx';
import type { BookStep } from '@/components/book/chair-summary';

const STEPS = ['Shop & service', 'Barber & time', 'The Shelf', 'Details & pay'] as const;

/** 1 Shop & service — 2 Barber & time — 3 The Shelf — 4 Details & pay. Done steps are links back. */
export const StepHeader = memo(function StepHeader({ step, reached, onGo }: { step: BookStep; reached: BookStep; onGo: (s: BookStep) => void }) {
	return (
		<ol className="flex items-center gap-2 text-[0.72rem] sm:gap-3" aria-label="Booking steps">
			{STEPS.map((label, i) => {
				const n = (i + 1) as 1 | 2 | 3 | 4;
				const current = n === step;
				const canGo = n < 4 && n <= reached && !current;
				const body = (
					<>
						<span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center border text-[0.7rem] font-bold', current ? 'border-green bg-green text-paper' : n < step ? 'border-green text-green' : 'border-paper-3 text-ink-3')}>{n < step ? '✓' : n}</span>
						<span className={clsx('label hidden text-[0.64rem] md:inline', current ? 'text-ink' : 'text-ink-3')}>{label}</span>
					</>
				);
				return (
					<li key={label} className="flex items-center gap-2 sm:gap-3">
						{canGo ? (
							<button type="button" onClick={() => onGo(n as BookStep)} className="flex min-h-[44px] items-center gap-2 hover:opacity-80">
								{body}
							</button>
						) : (
							<span className="flex min-h-[44px] items-center gap-2" aria-current={current ? 'step' : undefined}>
								{body}
							</span>
						)}
						{i < STEPS.length - 1 ? <span aria-hidden className="h-px w-4 bg-paper-3 sm:w-8" /> : null}
					</li>
				);
			})}
		</ol>
	);
});
