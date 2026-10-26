'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { saveDocket } from '@/lib/docket-snapshot';
import { money, type ShelfItem } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { ContactSection } from '@/components/checkout/contact-section';
import { PaymentSection } from '@/components/checkout/payment-section';
import { HouseReceipt } from '@/components/checkout/house-receipt';
import { HoldTimer } from '@/components/checkout/hold-timer';

function Section({ n, title, active, children, innerRef }: { n: number; title: string; active: boolean; children: ReactNode; innerRef?: React.Ref<HTMLElement> }) {
	return (
		<section ref={innerRef} className={clsx('scroll-mt-[calc(var(--header-h)+16px)] border-t border-paper-3 pt-6', !active && 'opacity-80')} aria-labelledby={`co-${n}`}>
			<h2 id={`co-${n}`} className="flex items-baseline gap-3">
				<span className="display text-2xl text-brass-lo">{n}</span>
				<span className="display text-2xl">{title}</span>
			</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

/**
 * /checkout (DESIGN.md "Checkout"): contact then payment on the left, the house receipt on the
 * right. Phones get the receipt as a "Show order" toggle on top.
 */
export function CheckoutView({ shelf }: { shelf: ShelfItem[] }) {
	const { cart, isLoaded } = useCart();
	const c = useCheckout();
	const [showOrder, setShowOrder] = useState(false);
	const payRef = useRef<HTMLElement>(null);
	const currency = cart?.paymentCurrencyCode ?? siteConfig.currency;

	// Keep a copy for the thank-you page: the cart is cleared when the order goes through.
	useEffect(() => saveDocket(cart), [cart]);
	// Contact saved → bring payment into view.
	useEffect(() => {
		if (c.step === 'payment-select') payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [c.step]);

	if (isLoaded && cart && !c.items.length) {
		return (
			<div className="mx-auto max-w-xl px-4 py-24 text-center">
				<h1 className="display text-5xl">Nothing booked yet</h1>
				<p className="mt-4 text-ink-2">Choose a shop, a service and a time first. Anything from the shelf goes on the same order.</p>
				<Link href="/book" className="btn btn-primary btn-lg mt-8">
					Book a chair
				</Link>
			</div>
		);
	}

	const receipt = cart ? <HouseReceipt items={c.items} shelf={shelf} currency={currency} /> : <div className="h-80 animate-pulse bg-paper-2" />;

	return (
		<div className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-10">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<Link href="/book" className="link text-sm text-ink-2">
						← Back to booking
					</Link>
					<h1 className="display mt-2 text-[2.2rem] leading-tight sm:text-5xl">Checkout</h1>
				</div>
				<div aria-live="polite">
					<HoldTimer />
				</div>
			</div>

			<div className="mt-5 lg:hidden">
				<button type="button" onClick={() => setShowOrder((s) => !s)} aria-expanded={showOrder} className="flex min-h-[52px] w-full items-center justify-between border-y border-paper-3 px-1 text-left">
					<span className="text-sm font-semibold">
						{showOrder ? 'Hide order' : 'Show order'} <span aria-hidden>{showOrder ? '▴' : '▾'}</span>
					</span>
					<span className="display text-2xl">{money(cart?.total ?? 0, currency)}</span>
				</button>
				{showOrder ? <div className="fade-in pt-4">{receipt}</div> : null}
			</div>

			<div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
				<div className="space-y-10">
					<Section n={1} title="Your details" active={c.step === 'customer'}>
						<ContactSection />
					</Section>
					<Section n={2} title="Payment" active={c.step !== 'customer'} innerRef={payRef}>
						<PaymentSection />
						{c.error ? (
							<p role="alert" className="mt-4 border-l-2 border-oxblood pl-3 text-sm text-oxblood">
								{c.error}
							</p>
						) : null}
					</Section>
					<p className="text-xs leading-relaxed text-ink-3">
						{siteConfig.policy.cancel} {siteConfig.policy.pickup}
					</p>
				</div>
				<aside aria-label="Your order" className="hidden lg:block">
					<div className="no-scrollbar sticky top-[calc(var(--header-h)+20px)] max-h-[calc(100svh-var(--header-h)-40px)] overflow-y-auto">{receipt}</div>
				</aside>
			</div>
		</div>
	);
}
