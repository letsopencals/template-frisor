'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { saveDocket } from '@/lib/docket-snapshot';
import { siteConfig } from '@/lib/site-config';
import type { ShelfItem } from '@/lib/catalog';
import { Wordmark } from '@/components/brand/wordmark';
import { TagLink } from '@/components/ui/tag';
import { DocketSittings } from '@/components/checkout/docket-sittings';
import { DocketShelf } from '@/components/checkout/docket-shelf';
import { DocketContact } from '@/components/checkout/docket-contact';
import { DocketSettle } from '@/components/checkout/docket-settle';

function Part({ n, title, children }: { n: string; title: string; children: ReactNode }) {
	return (
		<section className="px-6 py-7 sm:px-10">
			<h2 className="flex items-baseline gap-3">
				<span className="sign text-3xl font-black text-walnut">{n}</span>
				<span className="label text-ink">{title}</span>
			</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

const Perf = () => <div className="perf" aria-hidden />;

/**
 * The Docket (DESIGN.md "Checkout"): one long paper chit on the barber's spike. The sitting,
 * the shelf, who's sitting and settling up, perforated between parts. No accordion, no
 * sticky summary: the total is printed on the chit like a receipt.
 */
export function DocketView({ shelf }: { shelf: ShelfItem[] }) {
	const { cart, isLoaded } = useCart();
	const c = useCheckout();
	const currency = cart?.paymentCurrencyCode ?? siteConfig.currency;
	const mins = c.timeRemaining !== null ? Math.max(0, Math.floor(c.timeRemaining / 60)) : null;
	const secs = c.timeRemaining !== null ? Math.max(0, c.timeRemaining % 60) : null;

	// Keep a copy for the chair check: the cart is cleared when the order goes through.
	useEffect(() => saveDocket(cart), [cart]);

	if (isLoaded && cart && !c.items.length) {
		return (
			<div className="mx-auto max-w-xl px-5 py-24 text-center">
				<p className="sign gilt text-6xl font-black">The docket is empty</p>
				<p className="mt-4 text-towel/75">Hold a chair first, then everything from the shelf goes on the same docket.</p>
				<TagLink href="/book" className="mt-8">
					Take a chair
				</TagLink>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl px-3 pb-16 pt-10 sm:px-5">
			<div className="docket-spike mx-auto" aria-hidden />
			<div className="paper deckle relative pb-6 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.95)]" style={{ ['--perf-bg' as string]: 'var(--color-lacquer)' }}>
				<header className="flex items-end justify-between gap-4 border-b-2 border-dashed border-towel-3 px-6 pb-5 pt-8 sm:px-10">
					<div>
						<Wordmark tone="ink" className="text-4xl" />
						<p className="label mt-1 text-ink-3">The docket</p>
					</div>
					<div className="text-right" aria-live="polite">
						{c.isExpired ? (
							<p className="text-sm text-oxblood">
								The hold ran out.{' '}
								<button type="button" onClick={() => c.extendCart()} className="strop font-semibold">
									Hold it again
								</button>
							</p>
						) : mins !== null ? (
							<>
								<p className="label text-ink-3">Chair held</p>
								<p className="sign tabular text-3xl font-black">
									{mins}:{String(secs).padStart(2, '0')}
								</p>
							</>
						) : null}
					</div>
				</header>
				{!cart ? <div className="pole mx-10 my-10 h-2" aria-label="Reading the docket" /> : null}
				{cart ? (
					<>
						<Part n="I" title="The sitting">
							<DocketSittings items={c.items} currency={currency} />
							<Link href="/book" className="label strop mt-5 inline-block text-[0.65rem] text-ink-2">
								+ Another sitting (a friend, your son, a beard next week)
							</Link>
						</Part>
						<Perf />
						<Part n="II" title="The shelf">
							<DocketShelf shelf={shelf} currency={currency} />
						</Part>
						<Perf />
						<Part n="III" title="Who's sitting">
							<DocketContact />
						</Part>
						<Perf />
						<Part n="IV" title="Settle up">
							<DocketSettle />
							{c.error ? (
								<p role="alert" className="mt-4 border-l-2 border-oxblood pl-3 text-sm text-oxblood">
									{c.error}
								</p>
							) : null}
						</Part>
						<p className="px-6 pt-2 text-center text-xs text-ink-3 sm:px-10">
							{siteConfig.policy.cancel} {siteConfig.policy.pickup}
						</p>
					</>
				) : null}
			</div>
		</div>
	);
}
