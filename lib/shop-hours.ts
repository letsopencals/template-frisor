import { siteConfig } from '@/lib/site-config';

/**
 * Open / closed from `siteConfig.hours`, always in the shops' zone (Europe/Berlin), so a
 * visitor abroad still sees "Open until 20:00" in Berlin time. Client-safe; call after
 * hydration because it depends on "now".
 */

export type ShopState = { kind: 'open'; until: string } | { kind: 'later'; from: string } | { kind: 'closed'; nextDay: string; from: string };

const WEEKDAY: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
const LONG = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function zoned(now: Date, timeZone: string): { day: number; minutes: number } {
	const parts = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
	return { day: WEEKDAY[get('weekday')] ?? 1, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

export function shopState(now: Date, timeZone: string = siteConfig.timeZone): ShopState {
	const { day, minutes } = zoned(now, timeZone);
	const today = siteConfig.hours[day];
	if (today) {
		if (minutes >= toMin(today[0]) && minutes < toMin(today[1])) return { kind: 'open', until: today[1] };
		if (minutes < toMin(today[0])) return { kind: 'later', from: today[0] };
	}
	for (let i = 1; i <= 7; i++) {
		const d = ((day - 1 + i) % 7) + 1;
		const h = siteConfig.hours[d];
		if (h) return { kind: 'closed', nextDay: i === 1 ? 'tomorrow' : LONG[d]!, from: h[0] };
	}
	return { kind: 'closed', nextDay: '', from: '' };
}

export function shopStateLabel(s: ShopState): string {
	if (s.kind === 'open') return `Open until ${s.until}`;
	if (s.kind === 'later') return `Opens at ${s.from}`;
	return s.nextDay ? `Closed · opens ${s.nextDay} ${s.from}` : 'Closed';
}

/** The week as rows for a shop's hours board (Monday first). */
export function weekRows(): { day: string; hours: string }[] {
	return [1, 2, 3, 4, 5, 6, 7].map((d) => {
		const h = siteConfig.hours[d];
		return { day: LONG[d]!, hours: h ? `${h[0]}–${h[1]}` : 'Closed' };
	});
}
