'use client';

import useSWR from 'swr';
import { nextFree, studioAvailabilityKey, type StudioAvailability } from '@/lib/slots';

/**
 * The soonest free start for several (treatment, studio) pairs: one request per
 * pair to the cached `/api/availability/studio` route (whole horizon), two at a
 * time, only when `enabled` (e.g. once the board scrolls into view). Returns
 * `key → ms | null` where key is `${variantId}:${locationId}`; undefined while
 * loading. Never fetches per day.
 */
export interface FreePair {
	variantId: string;
	locationId: string;
}

async function load(pairs: FreePair[]): Promise<Record<string, number | null>> {
	const out: Record<string, number | null> = {};
	const queue = [...pairs];
	const worker = async () => {
		for (let p = queue.shift(); p; p = queue.shift()) {
			try {
				const res = await fetch(studioAvailabilityKey(p.variantId, p.locationId));
				const data = res.ok ? ((await res.json()) as StudioAvailability) : null;
				out[`${p.variantId}:${p.locationId}`] = nextFree(data)?.at ?? null;
			} catch {
				out[`${p.variantId}:${p.locationId}`] = null;
			}
		}
	};
	await Promise.all([worker(), worker()]);
	return out;
}

export function useNextFree(pairs: FreePair[], enabled = true) {
	const key = enabled && pairs.length ? ['next-free', pairs.map((p) => `${p.variantId}:${p.locationId}`).join(',')] : null;
	const { data } = useSWR(key, () => load(pairs), { revalidateOnFocus: false, dedupingInterval: 60_000, refreshInterval: 120_000 });
	return data;
}
