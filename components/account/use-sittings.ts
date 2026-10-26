'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { SittingRecord } from '@/lib/sittings';

/** The signed-in customer's appointments as `Sitting`s (newest first). */
export function useSittings() {
	const { data, error, isLoading, mutate } = useSWR<SittingRecord>('/api/account/sittings', fetcher, { revalidateOnFocus: false });
	return { sittings: data?.sittings ?? [], loading: isLoading, error, refresh: mutate };
}
