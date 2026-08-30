'use client';

import type { AddOnListItemResponse as AddOn } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';

interface AddOnsSelectorProps {
	addOns: AddOn[];
	loading: boolean;
	selected: Map<string, number>;
	bookedDurationUnits: number;
	currency?: string;
	onChange: (addOnId: string, quantity: number) => void;
}

export function AddOnsSelector({
	addOns,
	loading,
	selected,
	bookedDurationUnits,
	currency,
	onChange,
}: AddOnsSelectorProps) {
	if (loading) {
		return (
			<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
				<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
					Enhance Your Experience
				</p>
				<div className="mt-5 space-y-2">
					<div className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-2)]/40" />
					<div className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-2)]/40" />
					<div className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-2)]/40" />
				</div>
			</div>
		);
	}

	if (addOns.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
				<p className="text-sm text-[var(--color-cream-muted)]">No add-ons available for this service.</p>
				<p className="mt-1 text-xs text-[var(--color-cream-dim)]">Continue to review your booking.</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
			<div className="border-b border-[var(--color-line)] bg-[var(--color-bg-deep)] px-5 py-4">
				<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
					Enhance Your Experience
				</p>
				<p className="mt-1 text-[0.7rem] text-[var(--color-cream-dim)]">
					Optional add-ons — skip to continue without any.
				</p>
			</div>
			<ul className="divide-y divide-[var(--color-line)]">
				{addOns.map((addOn) => {
					const qty = selected.get(addOn.id) ?? 0;
					const isSelected = qty > 0;
					const isDuration = addOn.durationMultiplied;
					const displayPrice = isDuration ? addOn.price * bookedDurationUnits : addOn.price;
					const atMax =
						!isDuration && addOn.maxQuantity != null && qty >= addOn.maxQuantity;

					return (
						<li
							key={addOn.id}
							className={`flex items-start justify-between gap-4 px-5 py-4 transition-colors ${
								isSelected ? 'bg-[var(--color-copper)]/8' : ''
							}`}
						>
							<div className="min-w-0 flex-1">
								<p className="heading-display text-base text-[var(--color-cream)]">
									{addOn.title ?? addOn.slug}
								</p>
								{addOn.description && (
									<p className="mt-1 text-xs text-[var(--color-cream-muted)]">{addOn.description}</p>
								)}
								<p className="mt-2 text-sm">
									<span className="font-semibold text-[var(--color-copper)]">
										{formatPrice(displayPrice, currency)}
									</span>
									{isDuration && (
										<span className="ml-2 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-cream-dim)]">
											{formatPrice(addOn.price, currency)} × {bookedDurationUnits}
										</span>
									)}
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-1">
								{isDuration ? (
									<button
										type="button"
										onClick={() => onChange(addOn.id, isSelected ? 0 : 1)}
										className={`rounded-full border px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] transition-all ${
											isSelected
												? 'border-[var(--color-copper)] bg-[var(--color-copper)] text-[var(--color-bg-deep)]'
												: 'border-[var(--color-line-strong)] text-[var(--color-cream)] hover:border-[var(--color-copper)]/60'
										}`}
									>
										{isSelected ? 'Added' : 'Add'}
									</button>
								) : isSelected ? (
									<>
										<button
											type="button"
											onClick={() => onChange(addOn.id, qty - 1)}
											className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-cream)] transition-colors hover:border-[var(--color-copper)]"
											aria-label="Decrease quantity"
										>
											<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
											</svg>
										</button>
										<span className="w-7 text-center text-sm font-semibold text-[var(--color-cream)]">{qty}</span>
										<button
											type="button"
											disabled={atMax}
											onClick={() => onChange(addOn.id, qty + 1)}
											className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-cream)] transition-colors hover:border-[var(--color-copper)] disabled:cursor-not-allowed disabled:opacity-30"
											aria-label="Increase quantity"
										>
											<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
											</svg>
										</button>
									</>
								) : (
									<button
										type="button"
										onClick={() => onChange(addOn.id, 1)}
										className="rounded-full border border-[var(--color-line-strong)] px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:border-[var(--color-copper)] hover:text-[var(--color-copper)]"
									>
										Add
									</button>
								)}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
