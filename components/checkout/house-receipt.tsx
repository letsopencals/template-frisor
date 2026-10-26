'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { money, type ShelfItem } from '@/lib/catalog';
import type { CartItem } from '@opencals/storefront-sdk';
import { SittingLines, ShelfLines } from '@/components/checkout/receipt-lines';

function CodeField() {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError } = useCart();
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState(false);
	if (cart?.appliedDiscountCode) {
		return (
			<p className="flex items-center justify-between gap-3 text-sm">
				<span>
					Code <span className="font-bold tracking-wider">{cart.appliedDiscountCode}</span> applied
				</span>
				<button type="button" onClick={() => removeDiscountCode()} className="link text-xs text-ink-2">
					Remove
				</button>
			</p>
		);
	}
	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				if (!code.trim()) return;
				setBusy(true);
				if (await applyDiscountCode(code.trim())) setCode('');
				setBusy(false);
			}}
		>
			<label htmlFor="discount-code" className="text-sm font-semibold">
				Discount or gift code
			</label>
			<div className="mt-1.5 flex gap-2">
				<input id="discount-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoComplete="off" className="field min-w-0 flex-1 uppercase tracking-wider" aria-invalid={discountCodeError ? true : undefined} />
				<button type="submit" disabled={busy || !code.trim()} className="btn btn-outline">
					Apply
				</button>
			</div>
			{discountCodeError ? <p className="mt-1 text-xs text-oxblood">{discountCodeError.message ?? 'That code didn’t work.'}</p> : null}
		</form>
	);
}

/** Subtotal before discounts, each discount, VAT and the total. */
function Totals({ currency }: { currency: string }) {
	const { cart } = useCart();
	const discounts = cart?.appliedDiscounts ?? [];
	const before = (cart?.subtotal ?? 0) + discounts.reduce((n, d) => n + (d.totalAmount ?? 0), 0);
	return (
		<dl className="tabular space-y-1.5 text-sm">
			<div className="flex justify-between">
				<dt className="text-ink-2">Subtotal</dt>
				<dd>{money(before, currency)}</dd>
			</div>
			{discounts.map((d) => (
				<div key={d.id} className="flex justify-between gap-3 text-green">
					<dt>{d.code ? `${d.code} · ${d.title}` : d.title}</dt>
					<dd className="whitespace-nowrap">−{money(d.totalAmount, currency)}</dd>
				</div>
			))}
			{cart?.totalTax ? (
				<div className="flex justify-between text-ink-3">
					<dt>{cart.taxesIncluded ? 'Includes VAT' : 'VAT'}</dt>
					<dd>{money(cart.totalTax, currency)}</dd>
				</div>
			) : null}
			<div className="flex items-baseline justify-between border-t border-ink pt-3">
				<dt className="label text-ink-2">Total</dt>
				<dd className="display text-3xl">{money(cart?.total ?? 0, currency)}</dd>
			</div>
		</dl>
	);
}

/** The order as a printed house receipt (DESIGN.md "Checkout"): sittings, shelf, code, totals. */
export function HouseReceipt({ items, shelf, currency }: { items: CartItem[]; shelf: ShelfItem[]; currency: string }) {
	return (
		<div className="apoth p-5 sm:p-6">
			<p className="label text-brass-lo">Your order</p>
			<div className="mt-4">
				<SittingLines items={items} currency={currency} />
			</div>
			<div className="border-t border-paper-3 pt-4">
				<p className="label mb-3 text-ink-2">From the shelf · picked up at the chair</p>
				<ShelfLines shelf={shelf} currency={currency} />
			</div>
			<div className="mt-5 border-t border-paper-3 pt-4">
				<CodeField />
			</div>
			<div className="mt-5">
				<Totals currency={currency} />
			</div>
		</div>
	);
}
