'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { readDocket } from '@/lib/docket-snapshot';
import { useHydrated } from '@/hooks/use-hydrated';
import type { Sitting, SittingRecord } from '@/lib/sittings';
import type { ShelfItem } from '@/lib/catalog';
import { ConfirmationBody, type ShopRef } from '@/components/confirmation/confirmation-body';

const quiet = async <T,>(url: string): Promise<T | null> => {
	try {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as T) : null;
	} catch {
		return null;
	}
};

/**
 * /thank-you: the appointment label for what was just booked. Draws from the docket snapshot taken
 * before submit straight away, then from the account's sittings once the session is there
 * (new customers are signed in with the checkout token).
 */
export function ThankYouView({ shops, shelf }: { shops: ShopRef[]; shelf: ShelfItem[] }) {
	const orderId = useSearchParams().get('orderId');
	const hydrated = useHydrated();
	const { status } = useSession();
	const { data: record } = useSWR(status === 'authenticated' ? '/api/account/sittings' : null, quiet<SittingRecord>, { revalidateOnFocus: false });
	const snapshot = hydrated ? readDocket() : null;

	const sittings: Sitting[] = useMemo(() => {
		const fromOrder = orderId ? (record?.sittings ?? []).filter((s) => s.charge?.orderId === orderId) : [];
		return fromOrder.length ? fromOrder : (snapshot?.sittings ?? []);
	}, [orderId, record, snapshot]);

	if (!hydrated) return <div className="min-h-[60svh]" aria-busy="true" />;
	if (!sittings.length) {
		return (
			<div className="mx-auto max-w-xl px-4 py-24 text-center">
				<h1 className="display text-5xl">You’re booked in</h1>
				<p className="mt-4 text-ink-2">Your confirmation is on its way by email, with everything you need for the day.</p>
			</div>
		);
	}
	return <ConfirmationBody sittings={sittings} shops={shops} shelf={shelf} total={snapshot?.total ?? null} currency={snapshot?.currency ?? null} />;
}
