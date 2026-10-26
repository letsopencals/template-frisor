'use client';

import type { CartItem } from '@opencals/storefront-sdk';
import type { CartWithDiscounts } from '@/types/discount';
import { isShelfSlug } from '@/lib/catalog';
import type { Sitting } from '@/lib/sittings';

/**
 * What was on the docket, kept in sessionStorage across the submit, so the chair check on the
 * thank-you page draws straight away even when the order can't be read back yet (a guest, or a
 * slow read). Same `Sitting` shape the account renders.
 */
export interface DocketSnapshot {
	savedAt: number;
	currency: string;
	total: number;
	discount: number;
	sittings: Sitting[];
}

const KEY = 'frisor:docket';
const MAX_AGE = 6 * 60 * 60 * 1000;

function sittingOf(item: CartItem): Sitting | null {
	const a = item.appointment;
	if (!a) return null;
	const p = a.product;
	const l = a.location;
	const s = a.staffMember;
	return {
		id: a.id,
		status: 'scheduled',
		from: a.from,
		to: a.to,
		service: {
			id: p.id,
			slug: p.slug,
			title: p.title,
			option: p.variantTitle && p.variantTitle !== 'Default Title' ? p.variantTitle : null,
			duration: p.duration,
			price: item.originalUnitPrice ?? p.price,
			image: p.image?.url ?? null,
			allowCustomerCancel: p.allowCustomerCancel !== false,
			allowCustomerReschedule: p.allowCustomerReschedule !== false,
			cancelGap: p.cancelGap ?? 0,
			rescheduleGap: p.rescheduleGap ?? 0,
		},
		barber: s ? { id: s.id, slug: s.slug, name: [s.firstName, s.lastName].filter(Boolean).join(' '), firstName: s.firstName, imageUrl: s.image?.url ?? null } : null,
		shop: l
			? {
					id: l.id,
					slug: l.slug,
					title: l.title ?? '',
					addressLines: [l.addressLine1, [l.postalCode, l.city].filter(Boolean).join(' ')].filter((x): x is string => !!x),
					latitude: l.latitude,
					longitude: l.longitude,
				}
			: null,
		notes: [],
		lines: (item.addOnItems ?? []).map((x) => ({
			id: x.id,
			slug: x.addOn?.slug ?? null,
			title: x.addOn?.title ?? 'Extra',
			quantity: x.quantity,
			unitPrice: x.originalUnitPrice,
			image: (x.addOn as { image?: { url?: string | null } | null } | undefined)?.image?.url ?? null,
			shelf: isShelfSlug(x.addOn?.slug),
		})),
		charge: null,
	};
}

export function saveDocket(cart: CartWithDiscounts | null): void {
	if (!cart?.items?.length) return;
	const snap: DocketSnapshot = {
		savedAt: Date.now(),
		currency: cart.paymentCurrencyCode,
		total: cart.total,
		discount: (cart.appliedDiscounts ?? []).reduce((n, d) => n + (d.totalAmount ?? 0), 0),
		sittings: cart.items.map(sittingOf).filter((s): s is Sitting => !!s),
	};
	try {
		sessionStorage.setItem(KEY, JSON.stringify(snap));
	} catch {
		/* private mode: the thank-you page reads the order instead */
	}
}

export function readDocket(): DocketSnapshot | null {
	try {
		const raw = sessionStorage.getItem(KEY);
		if (!raw) return null;
		const s = JSON.parse(raw) as DocketSnapshot;
		return Date.now() - s.savedAt < MAX_AGE && Array.isArray(s.sittings) ? s : null;
	} catch {
		return null;
	}
}
