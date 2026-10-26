'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CartAddOnItem, CartItem } from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { isShelfSlug } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

/**
 * Put shelf products on the docket of a sitting that's already held in the cart (the apothecary,
 * the docket and the barber pages use it). Shelf products are add-ons, so they attach to a cart
 * item: the most recent sitting that offers the product.
 *
 * The house code (`siteConfig.shelf.autoCode`, SHELF15) goes on once the first shelf product
 * lands, only when no other code is on the cart, and comes off again with the last one. A store
 * without that code simply shows no saving: the error is swallowed.
 */
export interface ShelfTarget {
	id: string;
	slug: string;
	/** Variant ids the product can be added to. Empty = any. */
	serviceIds: string[];
}

export function shelfLines(items: CartItem[]): CartAddOnItem[] {
	return items.flatMap((i) => (i.addOnItems ?? []).filter((a) => isShelfSlug(a.addOn?.slug)));
}

export function useShelfDocket() {
	const { cart, cartId, setCart, applyDiscountCode, removeDiscountCode, clearDiscountCodeError, updateAddOnQuantity, removeAddOnItem } = useCart();
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const items = useMemo(() => (cart?.items ?? []) as CartItem[], [cart?.items]);

	/** Which held sitting a product would go on (latest first), or null when there's none. */
	const targetFor = useCallback(
		(p: ShelfTarget): CartItem | null => {
			const ok = (i: CartItem) => !p.serviceIds.length || (i.appointment?.product?.id ? p.serviceIds.includes(i.appointment.product.id) : true);
			return [...items].reverse().find(ok) ?? null;
		},
		[items],
	);

	const quantityOf = useCallback((addOnId: string) => shelfLines(items).filter((a) => a.addOnId === addOnId).reduce((n, a) => n + a.quantity, 0), [items]);

	const maybeApplyHouseCode = useCallback(async () => {
		const code = siteConfig.shelf.autoCode;
		if (!code) return;
		const ok = await applyDiscountCode(code);
		if (!ok) clearDiscountCodeError();
	}, [applyDiscountCode, clearDiscountCodeError]);

	const add = useCallback(
		async (p: ShelfTarget): Promise<boolean> => {
			const target = targetFor(p);
			if (!target || !cartId) return false;
			setBusy(p.id);
			setError(null);
			const hadShelf = shelfLines(items).length > 0;
			try {
				const existing = (target.addOnItems ?? []).find((a) => a.addOnId === p.id);
				if (existing) {
					await updateAddOnQuantity(existing.id, existing.quantity + 1);
				} else {
					const res = await fetch(`/api/cart/items/${target.id}/add-ons`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'X-Cart-Id': cartId },
						body: JSON.stringify({ addOnId: p.id, quantity: 1 }),
					});
					const body = await res.json().catch(() => null);
					if (!res.ok || !body?.id) throw new Error(body?.error ?? 'That one couldn’t go on the docket.');
					setCart(body);
				}
				if (!hadShelf && !cart?.appliedDiscountCode) await maybeApplyHouseCode();
				return true;
			} catch (e) {
				setError(e instanceof Error ? e.message : 'That one couldn’t go on the docket.');
				return false;
			} finally {
				setBusy(null);
			}
		},
		[targetFor, cartId, items, updateAddOnQuantity, setCart, cart?.appliedDiscountCode, maybeApplyHouseCode],
	);

	/** Change a shelf line's quantity; 0 removes it (and the house code with the last one). */
	const setQuantity = useCallback(
		async (line: CartAddOnItem, quantity: number) => {
			setBusy(line.addOnId);
			try {
				if (quantity > 0) {
					await updateAddOnQuantity(line.id, quantity);
					return;
				}
				await removeAddOnItem(line.id);
				const left = shelfLines(items).filter((a) => a.id !== line.id);
				const code = siteConfig.shelf.autoCode;
				if (code && left.length === 0 && cart?.appliedDiscountCode?.toUpperCase() === code.toUpperCase()) await removeDiscountCode();
			} finally {
				setBusy(null);
			}
		},
		[updateAddOnQuantity, removeAddOnItem, items, cart?.appliedDiscountCode, removeDiscountCode],
	);

	return { items, hasSitting: items.length > 0, targetFor, quantityOf, add, setQuantity, busy, error };
}
