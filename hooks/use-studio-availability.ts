'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { studioAvailabilityKey, type StudioAvailability } from '@/lib/slots';

/**
 * Availability for one treatment at several studios: one request per
 * (treatment, studio) to `/api/availability/studio`, each covering the whole
 * horizon. Requests are memoised in-module for 45 s so the studio step, the
 * time step and "sooner nearby" share them; `invalidateStudioAvailability()`
 * drops them (e.g. after a "time just taken" error).
 */

const TTL = 45_000;
const memo = new Map<string, { at: number; promise: Promise<StudioAvailability | null> }>();

function fetchStudio(url: string): Promise<StudioAvailability | null> {
	const hit = memo.get(url);
	if (hit && Date.now() - hit.at < TTL) return hit.promise;
	const promise = fetch(url)
		.then((res) => (res.ok ? (res.json() as Promise<StudioAvailability>) : null))
		.catch(() => null);
	memo.set(url, { at: Date.now(), promise });
	// A failed read shouldn't stick for the whole TTL.
	void promise.then((v) => {
		if (!v) memo.delete(url);
	});
	return promise;
}

let generation = 0;
export function invalidateStudioAvailability() {
	memo.clear();
	generation++;
}

export function useStudioAvailability(variantId: string | null | undefined, locationIds: string[]) {
	const ids = locationIds.join(',');
	const key = variantId && ids ? ['studio-availability', variantId, ids, generation] : null;
	const { data, isLoading, mutate } = useSWR(
		key,
		async ([, v, list]: [string, string, string, number]) => {
			const locs = list.split(',');
			const results = await Promise.all(locs.map((l) => fetchStudio(studioAvailabilityKey(v, l))));
			return Object.fromEntries(locs.map((l, i) => [l, results[i]])) as Record<string, StudioAvailability | null>;
		},
		{ revalidateOnFocus: false, keepPreviousData: false, dedupingInterval: 30_000 },
	);
	return useMemo(
		() => ({
			byLocation: (data ?? {}) as Record<string, StudioAvailability | null | undefined>,
			loading: !!key && isLoading,
			refresh: () => {
				invalidateStudioAvailability();
				return mutate();
			},
		}),
		[data, key, isLoading, mutate],
	);
}
