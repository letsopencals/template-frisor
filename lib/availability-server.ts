import '@/lib/opencals';
import { revalidateTag, unstable_cache } from 'next/cache';
import { OpencalsApiError, ProductService } from '@opencals/storefront-sdk';
import type { StudioAvailability, Window } from '@/lib/slots';

/**
 * Server-only availability reads. One merged-ranges call per (variant, studio,
 * clinician) covers the whole booking horizon (~30 days), so the client never
 * probes day by day: the day strip, the times, "next free" and "sooner nearby"
 * are all derived from these windows in the browser (`lib/slots.ts`).
 *
 * Each call is cached for 60 s and tagged, and every booking, cancel,
 * reschedule or cart removal revalidates the tags (`revalidateAvailability`).
 */

export const AVAILABILITY_TAG = 'availability';
export const variantTag = (variantId: string) => `availability-${variantId}`;
const TTL_SECONDS = 60;

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
	for (let attempt = 0; ; attempt++) {
		try {
			return await run();
		} catch (err) {
			const retryable = err instanceof OpencalsApiError && err.status === 429;
			if (!retryable || attempt >= 2) throw err;
			await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
		}
	}
}

const toMs = (date: string, time: string) => Date.parse(`${date}T${time}Z`);

/** Free windows for one clinician at one studio, across the horizon. */
function staffWindows(variantId: string, locationId: string, staffId: string): Promise<Window[]> {
	return unstable_cache(
		async (): Promise<Window[]> => {
			const { data } = await withRetry(() =>
				ProductService.getCurrentAvailabilitiesMerged({
					path: { productId: variantId },
					query: { locationId, staffMemberId: staffId },
					throwOnError: true,
				}),
			);
			return (Array.isArray(data) ? data : [])
				.filter((r) => (r.attendees ?? 0) < (r.maxAttendees ?? 1))
				.map((r): Window => [toMs(r.fromDate, r.fromTime), toMs(r.toDate, r.toTime)])
				.filter(([a, b]) => Number.isFinite(a) && b > a);
		},
		['studio-availability', variantId, locationId, staffId],
		{ revalidate: TTL_SECONDS, tags: [AVAILABILITY_TAG, variantTag(variantId)] },
	)();
}

/** Run `fn` over `items`, `size` at a time (gentle on the API's rate limits). */
async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const out = new Array<R>(items.length);
	let next = 0;
	await Promise.all(
		Array.from({ length: Math.min(size, items.length) }, async () => {
			while (next < items.length) {
				const i = next++;
				out[i] = await fn(items[i]!);
			}
		}),
	);
	return out;
}

/**
 * Every clinician's free windows for a variant at a studio. A clinician whose
 * call fails is left out and flagged `partial` (failures aren't cached), so one
 * bad call never blanks a studio.
 */
export async function studioAvailability(variantId: string, locationId: string, staffIds: string[], duration: number): Promise<StudioAvailability> {
	const results = await pool(staffIds, 3, async (staffId) => {
		try {
			return [staffId, await staffWindows(variantId, locationId, staffId)] as const;
		} catch {
			return [staffId, null] as const;
		}
	});
	const windows: Record<string, Window[]> = {};
	let failed = 0;
	for (const [staffId, w] of results) {
		if (w) windows[staffId] = w;
		else failed++;
	}
	return { variantId, locationId, duration, windows, partial: failed > 0 };
}

/** After a booking, cancel, reschedule or cart removal: drop cached windows. */
export function revalidateAvailability(variantId?: string | null) {
	try {
		revalidateTag(variantId ? variantTag(variantId) : AVAILABILITY_TAG);
	} catch {
		// Outside a request scope (tests): nothing cached to drop.
	}
}
