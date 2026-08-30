'use client';

import type { CheckoutStartResponse, CustomerProviderCatalogItem } from '@opencals/storefront-sdk';
import { StripePayment } from '@/components/booking/stripe-payment';

interface PaymentStepProps {
	providers: CustomerProviderCatalogItem[];
	provider: string | null;
	paymentData: CheckoutStartResponse | null;
	submitting: boolean;
	isExpired: boolean;
	onSelectProvider: (providerName: string) => void;
	onStripeSuccess: (paymentIntentId: string) => void;
	onStripeError: (message: string) => void;
	onSubmitCash: () => void;
}

export function PaymentStep({
	providers,
	provider,
	paymentData,
	submitting,
	isExpired,
	onSelectProvider,
	onStripeSuccess,
	onStripeError,
	onSubmitCash,
}: PaymentStepProps) {
	// Branch on the RESPONSE provider for the fallback: when nothing is collectible the backend
	// overrides the requested provider with "no payment required" (cast: the pinned SDK's union
	// predates it). clientSecret is null in that case, so showStripe/showCash won't match.
	const showNoPayment = (paymentData?.provider as string) === 'no_payment_required';
	const showStripe = !showNoPayment && provider === 'stripe' && paymentData?.clientSecret;
	const showCash = !showNoPayment && provider === 'cash' && paymentData;

	return (
		<div className="space-y-6">
			<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
				<div className="border-b border-[var(--color-line)] bg-[var(--color-bg-deep)] px-5 py-4">
					<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
						Payment Method
					</p>
				</div>
				<div className="space-y-3 px-5 py-5">
					{providers.length === 0 ? (
						<p className="text-sm text-[var(--color-cream-muted)]">
							No payment methods available. Please contact the shop.
						</p>
					) : (
						providers.map((p) => {
							const isSelected = provider === p.name;
							return (
								<button
									key={p.name}
									onClick={() => onSelectProvider(p.name)}
									disabled={submitting || isExpired}
									className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
										isSelected
											? 'border-[var(--color-copper)] bg-[var(--color-copper)]/10'
											: 'border-[var(--color-line-strong)] hover:border-[var(--color-copper)]/60'
									} disabled:cursor-not-allowed disabled:opacity-40`}
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-deep)] text-[var(--color-cream)]">
										{p.name === 'stripe' ? (
											<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
												<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
											</svg>
										) : p.name === 'cash' ? (
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
										) : (
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
												/>
											</svg>
										)}
									</div>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-[var(--color-cream)]">{p.displayName}</p>
										{p.description && (
											<p className="text-xs text-[var(--color-cream-muted)]">{p.description}</p>
										)}
									</div>
									{p.mode === 'test' && (
										<span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
											Test
										</span>
									)}
								</button>
							);
						})
					)}
				</div>
			</div>

			{showStripe && (
				<StripePayment
					clientSecret={paymentData!.clientSecret!}
					stripeAccountId={paymentData!.stripeAccountId}
					onSuccess={onStripeSuccess}
					onError={onStripeError}
					disabled={isExpired}
				/>
			)}

			{showNoPayment && (
				<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
					<div className="border-b border-[var(--color-line)] bg-[var(--color-bg-deep)] px-5 py-4">
						<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
							No Payment Required
						</p>
					</div>
					<div className="space-y-5 px-5 py-5 text-center">
						<p className="text-sm text-[var(--color-cream-muted)]">
							No payment is required — your booking is fully covered. Confirm to complete it.
						</p>
						<button
							onClick={onSubmitCash}
							disabled={submitting || isExpired}
							className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-copper)] px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg-deep)] transition-all hover:bg-[var(--color-copper-bright)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{submitting ? 'Confirming…' : 'Confirm Booking'}
						</button>
					</div>
				</div>
			)}

			{showCash && (
				<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
					<div className="border-b border-[var(--color-line)] bg-[var(--color-bg-deep)] px-5 py-4">
						<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
							Pay at Shop
						</p>
					</div>
					<div className="space-y-5 px-5 py-5 text-center">
						<p className="text-sm text-[var(--color-cream-muted)]">
							Your booking is confirmed. Please pay when you arrive.
						</p>
						<button
							onClick={onSubmitCash}
							disabled={submitting || isExpired}
							className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-copper)] px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg-deep)] transition-all hover:bg-[var(--color-copper-bright)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{submitting ? 'Confirming…' : 'Confirm Booking'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
