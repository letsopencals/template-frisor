/**
 * Client-safe slot maths over the windows from `/api/availability/studio`.
 * A start is offered on every `STEP`-minute mark inside a window, while the
 * whole visit still fits. Windows can open at odd minutes (today's opens at
 * "now + minimum notice"), so starts snap to the quarter-hour grid rather than
 * stepping from the window's first minute.
 */

/** [fromMs, toMs) in UTC. */
export type Window = [number, number];

export interface StudioAvailability {
	variantId: string;
	locationId: string;
	/** Visit length in seconds. */
	duration: number;
	/** staffId → free windows across the horizon. */
	windows: Record<string, Window[]>;
	/** Some clinicians couldn't be read; their times are missing. */
	partial?: boolean;
}

export interface Start {
	/** UTC ms */
	at: number;
	/** Clinicians free for the whole visit from `at`. */
	staffIds: string[];
}

export const STEP_MINUTES = 15;
const STEP = STEP_MINUTES * 60_000;

/** Local YYYY-MM-DD of a UTC instant in `timeZone`. */
export function localDate(ms: number, timeZone: string): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
}

/** Every start across the horizon, merged across clinicians, sorted. `staffId` narrows to one clinician. */
export function startsOf(a: StudioAvailability | null | undefined, staffId: string | null = null, now = Date.now()): Start[] {
	if (!a) return [];
	const dur = a.duration * 1000;
	const byAt = new Map<number, string[]>();
	for (const [sid, windows] of Object.entries(a.windows)) {
		if (staffId && sid !== staffId) continue;
		for (const [from, to] of windows) {
			for (let t = Math.ceil(from / STEP) * STEP; t + dur <= to; t += STEP) {
				if (t < now) continue;
				const list = byAt.get(t);
				if (list) list.push(sid);
				else byAt.set(t, [sid]);
			}
		}
	}
	return [...byAt.entries()].sort((x, y) => x[0] - y[0]).map(([at, staffIds]) => ({ at, staffIds }));
}

/** Starts grouped by local day. */
export function startsByDay(starts: Start[], timeZone: string): Map<string, Start[]> {
	const out = new Map<string, Start[]>();
	for (const s of starts) {
		const d = localDate(s.at, timeZone);
		const list = out.get(d);
		if (list) list.push(s);
		else out.set(d, [s]);
	}
	return out;
}

/** The soonest start, optionally for one clinician. */
export function nextFree(a: StudioAvailability | null | undefined, staffId: string | null = null, now = Date.now()): Start | null {
	return startsOf(a, staffId, now)[0] ?? null;
}

/** The API's slot shape for a start (UTC date/time parts). */
export function slotOf(at: number, durationSeconds: number) {
	const iso = (ms: number) => new Date(ms).toISOString();
	const from = iso(at);
	const to = iso(at + durationSeconds * 1000);
	return { fromDate: from.slice(0, 10), fromTime: from.slice(11, 19), toDate: to.slice(0, 10), toTime: to.slice(11, 19) };
}

export function studioAvailabilityKey(variantId: string, locationId: string): string {
	return `/api/availability/studio?variant=${encodeURIComponent(variantId)}&location=${encodeURIComponent(locationId)}`;
}
