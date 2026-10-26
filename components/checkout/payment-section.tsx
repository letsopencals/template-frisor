'use client';

import dynamic from 'next/dynamic';
import { useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { money } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

// Stripe only loads once a card payment starts.
const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <div className="h-40 animate-pulse bg-paper-2" aria-label="Loading the card form" />,
});

const TITLE: Record<string, string> = { stripe: 'Pay now by card', cash: 'Pay at the shop', bank_transfer: 'Bank transfer', no_payment_required: 'Nothing to pay' };
const COPY: Record<string, string> = {
	stripe: 'Card, Apple Pay or Google Pay.',
	cash: 'Card or cash at the till, after your appointment.',
	bank_transfer: 'We email the details with your confirmation.',
	no_payment_required: 'Confirmed straight away.',
};

/** Checkout section 2: how to pay. Greyed out until the contact details are saved. */
export function PaymentSection() {
	const { cart } = useCart();
	const c = useCheckout();
	const [chosen, setChosen] = useState<string | undefined>();
	const currency = cart?.paymentCurrencyCode ?? siteConfig.currency;
	const method = chosen && c.providers.some((p) => p.name === chosen) ? chosen : c.providers[0]?.name;
	const total = money(cart?.total ?? 0, currency);

	if (c.step === 'customer') return <p className="text-sm text-ink-3">Add your details above and the ways to pay appear here.</p>;

	if (c.step === 'payment' && c.paymentData?.clientSecret && c.selectedProvider === 'stripe') {
		return (
			<div className="space-y-4">
				<StripePayment clientSecret={c.paymentData.clientSecret} stripeAccountId={c.paymentData.stripeAccountId} publishableKey={c.paymentData.publishableKey} onSuccess={(pi) => c.handleSubmitCheckout(pi)} onError={(m) => c.setError(m)} disabled={c.isExpired || c.submitting} payLabel={total} />
				<button type="button" onClick={() => c.setStep('payment-select')} className="link text-sm text-ink-2">
					← Choose another way to pay
				</button>
			</div>
		);
	}

	if (c.providers.length === 0) return <p className="text-sm text-ink-2">Online payment isn’t available right now. Call the shop on {siteConfig.contact.phone} and we’ll book you in.</p>;

	const onPay = (e: FormEvent) => {
		e.preventDefault();
		if (method && !c.submitting && !c.isExpired) void c.handleStartCheckout(method);
	};

	return (
		<form onSubmit={onPay}>
			<fieldset className="space-y-2">
				<legend className="sr-only">How would you like to pay?</legend>
				{c.providers.map((p) => (
					<label key={p.name} className={clsx('flex min-h-[64px] cursor-pointer items-start gap-3 border p-4 transition-colors', method === p.name ? 'border-green bg-[#fbf8f2] shadow-[inset_0_0_0_1px_var(--color-green)]' : 'border-paper-3 hover:border-ink-3')}>
						<input type="radio" name="pay" value={p.name} checked={method === p.name} onChange={() => setChosen(p.name)} className="mt-1 h-4 w-4 accent-[#1e3a2f]" />
						<span>
							<span className="block font-semibold">
								{TITLE[p.name] ?? p.displayName}
								{p.mode === 'test' ? <span className="label ml-2 bg-brass-hi/50 px-1.5 py-0.5 text-[0.55rem]">Test mode</span> : null}
							</span>
							<span className="text-sm text-ink-2">{COPY[p.name] ?? p.description}</span>
						</span>
					</label>
				))}
			</fieldset>
			<button type="submit" disabled={!method || c.submitting || c.isExpired} className="btn btn-primary btn-lg mt-5 w-full">
				{c.submitting ? 'One moment…' : method === 'stripe' ? `Continue to card · ${total}` : `Confirm booking · ${total}`}
			</button>
		</form>
	);
}
