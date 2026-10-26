'use client';

import dynamic from 'next/dynamic';
import { useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { money } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { TagButton } from '@/components/ui/tag';

// Stripe only loads once a card payment starts.
const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <div className="pole h-1.5 w-32" aria-label="Loading the card form" />,
});

const TITLE: Record<string, string> = { stripe: 'Card now', cash: 'At the till', bank_transfer: 'Bank transfer', no_payment_required: 'Nothing to pay' };
const COPY: Record<string, string> = {
	stripe: 'Card, Apple Pay or Google Pay. Settled before you sit.',
	cash: 'Pay at the till after the hot towel. Card or cash.',
	bank_transfer: 'We email the details with your chair check.',
	no_payment_required: 'Nothing to pay today, so it’s confirmed straight away.',
};

/** Docket part four: the receipt (subtotal, the house code, tax, total), a code box, and how you pay. */
export function DocketSettle() {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError } = useCart();
	const c = useCheckout();
	const [code, setCode] = useState('');
	const [chosen, setChosen] = useState<string | undefined>();
	const currency = cart?.paymentCurrencyCode ?? siteConfig.currency;
	const method = chosen && c.providers.some((p) => p.name === chosen) ? chosen : c.providers[0]?.name;
	const discounts = cart?.appliedDiscounts ?? [];
	// The cart's subtotal is after discounts; print the docket's lines before them, then each saving.
	const before = (cart?.subtotal ?? 0) + discounts.reduce((n, d) => n + (d.totalAmount ?? 0), 0);

	const onPay = (e: FormEvent) => {
		e.preventDefault();
		if (method && !c.submitting && !c.isExpired) void c.handleStartCheckout(method);
	};

	return (
		<div>
			<dl className="tabular space-y-1.5 text-sm">
				<div className="flex justify-between">
					<dt className="text-ink-2">On the docket</dt>
					<dd>{money(before, currency)}</dd>
				</div>
				{discounts.map((d) => (
					<div key={d.id} className="flex justify-between text-walnut">
						<dt>{d.code ? `${d.code} · ${d.title}` : d.title}</dt>
						<dd>−{money(d.totalAmount, currency)}</dd>
					</div>
				))}
				{cart?.totalTax ? (
					<div className="flex justify-between text-ink-2">
						<dt>{cart.taxesIncluded ? 'Of which VAT' : 'VAT'}</dt>
						<dd>{money(cart.totalTax, currency)}</dd>
					</div>
				) : null}
				<div className="flex items-baseline justify-between border-y-2 border-ink py-2">
					<dt className="label">To settle</dt>
					<dd className="serif text-4xl">{money(cart?.total ?? 0, currency)}</dd>
				</div>
			</dl>

			{cart?.appliedDiscountCode ? (
				<p className="mt-3 text-xs text-ink-2">
					Code {cart.appliedDiscountCode} is on.{' '}
					<button type="button" onClick={() => removeDiscountCode()} className="strop">
						Take it off
					</button>
				</p>
			) : (
				<form
					className="mt-3 flex gap-2"
					onSubmit={async (e) => {
						e.preventDefault();
						if (code.trim() && (await applyDiscountCode(code.trim()))) setCode('');
					}}
				>
					<label htmlFor="code" className="sr-only">
						Gift or discount code
					</label>
					<input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Gift or discount code" className="min-w-0 flex-1 border-b-2 border-towel-3 bg-transparent py-1.5 text-sm uppercase tracking-wider focus:border-ink focus:outline-none" />
					<button type="submit" className="label border border-ink px-3 text-[0.65rem] hover:bg-ink hover:text-towel">
						Apply
					</button>
				</form>
			)}
			{discountCodeError ? <p className="mt-1 text-xs text-oxblood">{discountCodeError.message ?? 'That code didn’t work.'}</p> : null}

			<div className="mt-8">
				{c.step === 'customer' ? (
					<p className="text-sm text-ink-3">File who&rsquo;s sitting above and the ways to pay appear here.</p>
				) : c.step === 'payment' && c.paymentData?.clientSecret && c.selectedProvider === 'stripe' ? (
					<div className="space-y-4">
						<StripePayment clientSecret={c.paymentData.clientSecret} stripeAccountId={c.paymentData.stripeAccountId} publishableKey={c.paymentData.publishableKey} onSuccess={(pi) => c.handleSubmitCheckout(pi)} onError={(m) => c.setError(m)} disabled={c.isExpired || c.submitting} payLabel={money(cart?.total ?? 0, currency)} />
						<button type="button" onClick={() => c.setStep('payment-select')} className="label strop text-[0.65rem] text-ink-2">
							← Another way to pay
						</button>
					</div>
				) : c.providers.length === 0 ? (
					<p className="text-sm text-ink-2">No way to pay online right now. Call the shop on {siteConfig.contact.phone} and we&rsquo;ll book you in.</p>
				) : (
					<form onSubmit={onPay}>
						<fieldset className="grid gap-2 sm:grid-cols-2">
							<legend className="sr-only">How would you like to pay?</legend>
							{c.providers.map((p) => (
								<label key={p.name} className={clsx('flex cursor-pointer gap-3 border-2 p-3', method === p.name ? 'border-ink bg-towel-2/60' : 'border-towel-3')}>
									<input type="radio" name="pay" value={p.name} checked={method === p.name} onChange={() => setChosen(p.name)} className="mt-1 h-4 w-4 accent-[#161d1b]" />
									<span>
										<span className="block font-semibold">
											{TITLE[p.name] ?? p.displayName}
											{p.mode === 'test' ? <span className="label ml-2 bg-brass/40 px-1 text-[0.55rem]">Test</span> : null}
										</span>
										<span className="text-xs text-ink-2">{COPY[p.name] ?? p.description}</span>
									</span>
								</label>
							))}
						</fieldset>
						<TagButton type="submit" variant="ink" size="lg" full className="mt-5" disabled={!method || c.submitting || c.isExpired}>
							{c.submitting ? 'One moment…' : method === 'stripe' ? 'Continue to card' : 'Confirm the chair'}
						</TagButton>
					</form>
				)}
			</div>
		</div>
	);
}
