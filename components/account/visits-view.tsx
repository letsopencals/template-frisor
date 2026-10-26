'use client';

import Link from 'next/link';
import { isUpcoming, type Sitting } from '@/lib/sittings';
import type { ShelfItem } from '@/lib/catalog';
import { useHydrated } from '@/hooks/use-hydrated';
import { useSittings } from '@/components/account/use-sittings';
import { NextVisit } from '@/components/account/next-visit';
import { VisitRow } from '@/components/account/visit-row';
import { YourShelf } from '@/components/account/your-shelf';

interface Props {
	shelf: ShelfItem[];
	shops: { id: string; short: string }[];
	currency: string;
}

/** /account: the next visit, other upcoming ones, past visits with Book again, and your shelf. */
export function VisitsView(props: Props) {
	const { sittings, loading, error } = useSittings();
	const hydrated = useHydrated();
	if (loading || !hydrated) return <div className="h-64 animate-pulse bg-paper-2" aria-busy="true" />;
	if (error) return <p className="text-oxblood">We couldn’t load your visits. Please refresh the page.</p>;
	return <VisitsBody {...props} sittings={sittings} now={Date.now()} />;
}

/** Pure props, so /preview renders it with fixtures. */
export function VisitsBody({ sittings, shelf, shops, currency, now }: Props & { sittings: Sitting[]; now: number }) {
	const upcoming = sittings.filter((s) => isUpcoming(s, now)).sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
	const past = sittings.filter((s) => !isUpcoming(s, now));
	const [next, ...later] = upcoming;

	return (
		<div>
			{next ? (
				<NextVisit s={next} shopShort={shops.find((x) => x.id === next.shop?.id)?.short ?? next.shop?.title ?? ''} />
			) : (
				<section className="bg-paper-2 p-8 text-center">
					<p className="display text-3xl">Nothing booked.</p>
					<p className="mt-2 text-ink-2">{past.length ? 'Due a trim? Book again from your last visit below.' : 'Your visits will show up here.'}</p>
					<Link href="/book" className="btn btn-primary mt-5">
						Book a chair
					</Link>
				</section>
			)}

			{later.length ? (
				<section className="mt-12" aria-label="Also booked">
					<h2 className="display border-b border-paper-3 pb-3 text-3xl">Also booked</h2>
					<ul>
						{later.map((s) => (
							<VisitRow key={s.id} s={s} past={false} />
						))}
					</ul>
				</section>
			) : null}

			<YourShelf sittings={sittings} shelf={shelf} currency={currency} />

			{past.length ? (
				<section className="mt-14" aria-label="Past visits">
					<h2 className="display border-b border-paper-3 pb-3 text-3xl">Past visits</h2>
					<ul>
						{past.map((s) => (
							<VisitRow key={s.id} s={s} past />
						))}
					</ul>
				</section>
			) : null}
		</div>
	);
}
