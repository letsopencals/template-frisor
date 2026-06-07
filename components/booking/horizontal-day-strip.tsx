'use client';

import { useMemo, useState, useRef, useEffect } from 'react';

interface HorizontalDayStripProps {
	selectedDate: string | null;
	onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function HorizontalDayStrip({ selectedDate, onDateSelect }: HorizontalDayStripProps) {
	const today = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const [windowSize, setWindowSize] = useState(21);
	const scrollRef = useRef<HTMLDivElement>(null);

	const days = useMemo(() => {
		const arr: Date[] = [];
		for (let i = 0; i < windowSize; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() + i);
			arr.push(d);
		}
		return arr;
	}, [today, windowSize]);

	// Scroll selected card into view when it changes
	useEffect(() => {
		if (!selectedDate || !scrollRef.current) return;
		const el = scrollRef.current.querySelector(`[data-date="${selectedDate}"]`);
		el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
	}, [selectedDate]);

	const firstDay = days[0];
	const lastDay = days[days.length - 1];
	const monthHeader = (() => {
		if (!firstDay) return '';
		const startMonth = MONTHS_SHORT[firstDay.getMonth()];
		const endMonth = lastDay ? MONTHS_SHORT[lastDay.getMonth()] : startMonth;
		if (startMonth === endMonth) return `${startMonth} ${firstDay.getFullYear()}`;
		return `${startMonth} – ${endMonth} ${lastDay?.getFullYear() ?? firstDay.getFullYear()}`;
	})();

	return (
		<div>
			<div className="mb-4 flex items-baseline justify-between">
				<p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream)]">
					{monthHeader}
				</p>
				<button
					type="button"
					onClick={() => setWindowSize((n) => n + 14)}
					className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-copper)] transition-colors hover:text-[var(--color-copper-bright)]"
				>
					Show more →
				</button>
			</div>

			<div
				ref={scrollRef}
				className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-1"
			>
				{days.map((d, i) => {
					const dateStr = formatDateStr(d);
					const weekdayIdx = d.getDay();
					const weekdayLabel = WEEKDAYS[weekdayIdx] ?? '';
					const isSelected = dateStr === selectedDate;
					const isToday = i === 0;

					return (
						<button
							key={dateStr}
							type="button"
							data-date={dateStr}
							onClick={() => onDateSelect(dateStr)}
							className={`group flex shrink-0 snap-start flex-col items-center rounded-xl border px-3 py-3 transition-all sm:px-4 sm:py-3.5 ${
								isSelected
									? 'border-[var(--color-copper)] bg-[var(--color-copper)] text-[var(--color-bg-deep)]'
									: 'border-[var(--color-line-strong)] bg-[var(--color-bg)] text-[var(--color-cream)] hover:border-[var(--color-copper)]/60'
							}`}
							style={{ minWidth: '64px' }}
						>
							<span
								className={`text-[0.55rem] font-semibold uppercase tracking-[0.2em] ${
									isSelected ? 'text-[var(--color-bg-deep)]/70' : 'text-[var(--color-cream-dim)]'
								}`}
							>
								{weekdayLabel}
							</span>
							<span className="heading-display mt-1 text-2xl leading-none">
								{d.getDate()}
							</span>
							<span
								className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
									isToday
										? isSelected
											? 'bg-[var(--color-bg-deep)]'
											: 'bg-[var(--color-copper)]'
										: 'bg-transparent'
								}`}
								aria-hidden
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
