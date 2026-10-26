import '@/lib/opencals';
import { cache } from 'react';
import {
	StoreService,
	ProductService,
	ProductCollectionService,
	StaffMemberService,
	AddonService,
	LocationService,
	CheckoutQuestionService,
	type CheckoutQuestionResponse,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductCollectionResponse,
	type AddOnListItemResponse,
} from '@opencals/storefront-sdk';
import { publicPayload } from '@/lib/public-payload';
import { siteConfig } from '@/lib/site-config';
import { sortBarbers, toBarber, type Barber } from '@/lib/catalog';

/**
 * Server-only data readers. Each is wrapped in React.cache() so repeated calls
 * within a single request are deduped. RSCs call these directly instead of
 * going through the template's own /api/* routes. Never import this module from
 * a 'use client' file — the /api/* routes remain the client/SWR data source.
 * Everything that reaches the browser goes through `publicPayload` or a
 * public-safe mapper.
 */

export const getStoreSettings = cache(async (): Promise<StorePublicSettings | null> => {
	try {
		const { data } = await StoreService.getStorePublicSettings();
		return data ?? null;
	} catch {
		return null;
	}
});

export const getProducts = cache(async (locationId?: string): Promise<ProductListItemResponse[]> => {
	try {
		const { data } = await ProductService.list({ query: { take: 100, locationId } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/**
 * The product group that owns `slug` (the group's slug or one of its variants).
 * The composer needs each variant's `staffMembers` (with `locations`) and
 * `locations`, which only the list shape carries. Mirrors
 * `app/api/products/[slug]/route.ts`.
 */
export const getProduct = cache(async (slug: string): Promise<ProductListItemResponse | null> => {
	const items = await getProducts();
	return items.find((item) => item.slug === slug || item.variants?.some((v) => v.slug === slug)) ?? null;
});

export const getCollections = cache(async (): Promise<ProductCollectionResponse[]> => {
	try {
		const { data } = await ProductCollectionService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getCollection = cache(async (slug: string): Promise<ProductCollectionResponse | null> => {
	try {
		const { data } = await ProductCollectionService.getBySlug({ path: { slug } });
		return data ? publicPayload(data) : null;
	} catch {
		return null;
	}
});

/** variant slug → menu section (collection) slug. */
export const getSectionIndex = cache(async (): Promise<Record<string, string>> => {
	const out: Record<string, string> = {};
	for (const c of await getCollections()) for (const p of c.products ?? []) if (p.slug && !out[p.slug]) out[p.slug] = c.slug;
	return out;
});

export const getBarbers = cache(async (): Promise<Barber[]> => {
	try {
		const { data } = await StaffMemberService.list({ query: { take: 100 } });
		return sortBarbers((data?.data ?? []).map(toBarber));
	} catch {
		return [];
	}
});

/** Every active add-on (shelf products and in-chair extras). Staff on them are scrubbed. */
export const getAddOns = cache(async (): Promise<AddOnListItemResponse[]> => {
	try {
		const { data } = await AddonService.list({ query: { take: 100, status: ['active'] } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/** Public-safe location card. `type` lets callers split physical shops from any online location. */
export interface PublicLocation {
	id: string;
	slug: string;
	title: string;
	type: 'physical' | 'online' | 'delivery';
	addressLines: string[];
	city: string | null;
	latitude: number | null;
	longitude: number | null;
	scheduleId: string | null;
}

export const getLocations = cache(async (): Promise<PublicLocation[]> => {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return (data?.data ?? []).map((l) => {
			const cityLine = [l.city, [l.state, l.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
			return {
				id: l.id,
				slug: l.slug,
				title: l.title ?? siteConfig.shortName,
				type: l.type,
				addressLines: l.displayAddress
					? splitDisplayAddress(l.displayAddress)
					: [l.addressLine1, l.addressLine2, cityLine].filter((x): x is string => !!x),
				city: l.city ?? null,
				latitude: l.latitude ?? null,
				longitude: l.longitude ?? null,
				scheduleId: l.scheduleId ?? null,
			};
		});
	} catch {
		return [];
	}
});

function splitDisplayAddress(display: string): string[] {
	const lines = display.split('\n').map((x) => x.trim()).filter(Boolean);
	if (lines.length > 1) return lines;
	const [first, ...rest] = display.split(',');
	return [(first ?? '').trim(), rest.join(',').trim()].filter(Boolean);
}

/**
 * A variant's pre-visit (checkout) questions, English translations. Questions
 * carry no merchant-private data (titles, options, file limits), so they are
 * passed to the composer as-is; `/api/products/[slug]/questions` mirrors this.
 */
export const getCheckoutQuestions = cache(async (productId: string): Promise<CheckoutQuestionResponse[]> => {
	try {
		const { data } = await CheckoutQuestionService.listTranslations({ path: { productId, language: 'en' } });
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
});
