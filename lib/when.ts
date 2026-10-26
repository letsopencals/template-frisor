/**
 * Human times for the booking surfaces, always in the studio's zone
 * (Europe/London by default). Client-safe; call after hydration when the
 * output depends on "now".
 */

const fmt = (timeZone: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone, ...opts });

export function timeLabel(ms: number, timeZone: string, hour12 = false): string {
	return fmt(timeZone, { hour: hour12 ? 'numeric' : '2-digit', minute: '2-digit', hour12 }).format(ms).replace(' ', '').toLowerCase();
}

function dayKey(ms: number, timeZone: string): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
}

/** "Today", "Tomorrow", "Thu 30 Oct". */
export function dayLabel(ms: number, timeZone: string, now = Date.now()): string {
	const d = dayKey(ms, timeZone);
	if (d === dayKey(now, timeZone)) return 'Today';
	if (d === dayKey(now + 86_400_000, timeZone)) return 'Tomorrow';
	return fmt(timeZone, { weekday: 'short', day: 'numeric', month: 'short' }).format(ms);
}

/** "Today 16:15", "Tomorrow 08:30", "Thu 30 Oct, 09:00". */
export function nextFreeLabel(ms: number, timeZone: string, now = Date.now(), hour12 = false): string {
	const day = dayLabel(ms, timeZone, now);
	const sep = day === 'Today' || day === 'Tomorrow' ? ' ' : ', ';
	return `${day}${sep}${timeLabel(ms, timeZone, hour12)}`;
}

/** "Thursday 30 October". */
export function longDate(ms: number, timeZone: string): string {
	return fmt(timeZone, { weekday: 'long', day: 'numeric', month: 'long' }).format(ms);
}

/** "October 2027" for recalls. */
export function monthLabel(ms: number, timeZone: string): string {
	return fmt(timeZone, { month: 'long', year: 'numeric' }).format(ms);
}

/** Minutes past local midnight (morning / afternoon / evening grouping). */
export function localMinutes(ms: number, timeZone: string): number {
	const parts = fmt(timeZone, { hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(ms);
	const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
	const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
	return h * 60 + m;
}
