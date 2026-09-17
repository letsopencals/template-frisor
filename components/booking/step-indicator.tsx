'use client';

import { memo } from 'react';
import { STEP_LABELS, type BookingStep } from '@/lib/booking-constants';

interface StepIndicatorProps {
	steps: BookingStep[];
	current: BookingStep;
	completed: Record<BookingStep, boolean>;
	canEnter: (s: BookingStep) => boolean;
	onSelect: (s: BookingStep) => void;
}

export const StepIndicator = memo(function StepIndicator({
	steps,
	current,
	completed,
	canEnter,
	onSelect,
}: StepIndicatorProps) {
	return (
		<ol className="no-scrollbar -mx-2 flex items-center gap-2 overflow-x-auto border-b border-[var(--color-line)] px-2 pb-4">
			{steps.map((s, i) => {
				const isActive = s === current;
				const isDone = completed[s] && !isActive;
				const enabled = canEnter(s);
				const index = String(i + 1).padStart(2, '0');
				return (
					<li key={s} className="flex shrink-0 items-center gap-2">
						<button
							type="button"
							disabled={!enabled}
							onClick={() => onSelect(s)}
							className={`group flex items-baseline gap-2 rounded-full border px-4 py-2 transition-all ${
								isActive
									? 'border-[var(--color-copper)] bg-[var(--color-copper)]/10'
									: enabled
										? 'border-[var(--color-line-strong)] hover:border-[var(--color-copper)]/60'
										: 'border-[var(--color-line)] opacity-50'
							}`}
						>
							<span
								className={`text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${
									isActive
										? 'text-[var(--color-copper)]'
										: isDone
											? 'text-[var(--color-cream)]/75'
											: 'text-[var(--color-cream-dim)]'
								}`}
							>
								{index}
							</span>
							<span
								className={`heading-display text-base ${
									isActive
										? 'text-[var(--color-cream)]'
										: isDone
											? 'text-[var(--color-cream)]/85'
											: 'text-[var(--color-cream)]/55'
								}`}
							>
								{STEP_LABELS[s]}
							</span>
							{isDone ? (
								<svg
									className="h-3.5 w-3.5 text-[var(--color-copper)]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							) : null}
						</button>
						{i < steps.length - 1 ? (
							<span className="text-[0.65rem] text-[var(--color-cream-dim)]">→</span>
						) : null}
					</li>
				);
			})}
		</ol>
	);
});
