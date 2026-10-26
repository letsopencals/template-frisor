import type { CartWithDiscounts } from '@/types/discount';
import { isShelfSlug } from '@/lib/catalog';

/** The running tab in the Counter bar and the docket: what's on the cart, counted the shop's way. */
export interface Tab {
	sittings: number;
	shelfUnits: number;
	extras: number;
	total: number;
	currency: string;
}

export function tabOf(cart: CartWithDiscounts | null | undefined): Tab | null {
	if (!cart || !cart.items?.length) return null;
	let shelfUnits = 0;
	let extras = 0;
	for (const item of cart.items) {
		for (const a of item.addOnItems ?? []) {
			if (isShelfSlug(a.addOn?.slug)) shelfUnits += a.quantity;
			else extras += a.quantity;
		}
	}
	return { sittings: cart.items.length, shelfUnits, extras, total: cart.total, currency: cart.paymentCurrencyCode };
}
