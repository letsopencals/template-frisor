'use client';

import { useMemo, useState } from 'react';
import { type Appearance, type StripeError, loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

interface StripePaymentProps {
	clientSecret: string;
	stripeAccountId?: string | null;
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
}

export function StripePayment({ clientSecret, stripeAccountId, onSuccess, onError, disabled }: StripePaymentProps) {
	const stripePromise = useMemo(() => {
		if (!publishableKey) return null;
		return loadStripe(publishableKey, {
			stripeAccount: stripeAccountId ?? undefined,
		});
	}, [stripeAccountId]);

	const appearance = useMemo(
		(): Appearance => ({
			theme: 'night',
			variables: {
				colorPrimary: '#c08552',
				colorBackground: '#1a1815',
				colorText: '#efe6d8',
				colorDanger: '#dc2626',
				fontFamily: 'system-ui, -apple-system, sans-serif',
				spacingUnit: '4px',
				borderRadius: '8px',
			},
		}),
		[],
	);

	const options = useMemo(() => ({ clientSecret, appearance }), [clientSecret, appearance]);

	if (!publishableKey) {
		return (
			<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
				<p className="text-sm text-red-300">
					Stripe is not configured. Set{' '}
					<code className="rounded bg-red-500/20 px-1 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment.
				</p>
			</div>
		);
	}

	if (!stripePromise) return null;

	return (
		<Elements stripe={stripePromise} options={options}>
			<StripePaymentForm onSuccess={onSuccess} onError={onError} disabled={disabled} />
		</Elements>
	);
}

function StripePaymentForm({
	onSuccess,
	onError,
	disabled,
}: {
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
}) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	const handlePay = async () => {
		if (!stripe || !elements || processing) return;
		setProcessing(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				redirect: 'if_required',
			});
			if (error) {
				onError((error as StripeError).message ?? 'Payment failed');
				return;
			}
			if (paymentIntent?.id) {
				onSuccess(paymentIntent.id);
			} else {
				onError('Payment confirmation did not return a valid result.');
			}
		} catch (err: unknown) {
			onError(err instanceof Error ? err.message : 'Payment failed');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
			<div className="border-b border-[var(--color-line)] bg-[var(--color-bg-deep)] px-5 py-4">
				<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
					Card Payment
				</p>
			</div>
			<div className="space-y-5 px-5 py-5">
				<PaymentElement options={{ layout: 'tabs' }} />
				<button
					onClick={handlePay}
					disabled={!stripe || !elements || processing || disabled}
					className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-copper)] px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg-deep)] transition-all hover:bg-[var(--color-copper-bright)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					{processing ? (
						<>
							<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
							Processing Payment…
						</>
					) : (
						<>
							Pay &amp; Confirm
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</>
					)}
				</button>
			</div>
		</div>
	);
}
