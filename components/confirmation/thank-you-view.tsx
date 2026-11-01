'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { readDocket } from '@/lib/docket-snapshot';
import { readOutcome } from '@/lib/checkout-outcome';
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
	const outcome = hydrated ? readOutcome(orderId) : null;

	const sittings: Sitting[] = useMemo(() => {
		const fromOrder = orderId ? (record?.sittings ?? []).filter((s) => s.charge?.orderId === orderId) : [];
		if (fromOrder.length) return fromOrder;
		// The docket was taken before submit: take each booking's status from what submit answered.
		return (snapshot?.sittings ?? []).map((s) => {
			const a = outcome?.appointments[s.id];
			return a ? { ...s, status: a.status, pendingReason: a.pendingReason } : s;
		});
	}, [orderId, record, snapshot, outcome]);

	if (!hydrated) return <div className="min-h-[60svh]" aria-busy="true" />;
	if (!sittings.length) {
		return (
			<div className="mx-auto max-w-xl px-4 py-24 text-center">
				<h1 className="display text-5xl">Booking received</h1>
				<p className="mt-4 text-ink-2">Everything you need is on its way by email: whether it’s confirmed, the details for the day and, if anything is left to pay, how to pay it.</p>
			</div>
		);
	}
	const payment = outcome ? { provider: outcome.provider, instructions: outcome.instructions, dueAt: outcome.paymentDueAt, reference: outcome.orderName } : null;
	return <ConfirmationBody sittings={sittings} shops={shops} shelf={shelf} total={snapshot?.total ?? null} currency={snapshot?.currency ?? null} payment={payment} paymentStatus={outcome?.paymentStatus ?? null} />;
}
