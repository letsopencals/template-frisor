import type { AddOnListItemResponse, ProductCollectionResponse, ProductListItemResponse } from '@opencals/storefront-sdk';
import { siteConfig, shopMeta, type ShelfNote } from '@/lib/site-config';
import { compareOptions } from '@/lib/variant-order';

/**
 * The shop's catalogue as small, public-safe shapes: services (bookable variants), the menu
 * (collections), barbers, shops and the shelf (retail add-ons). Built on the server in
 * `lib/catalog-server.ts` and handed to client components as plain props. Client-safe.
 */

export interface Service {
	/** Variant id (what availability and booking take). */
	id: string;
	/** Variant slug (what `/book?service=` takes). */
	slug: string;
	/** Product group id; variants of one group share it. */
	groupId: string;
	groupTitle: string;
	/** The option within the group ("Skin Fade"), or null for single-option groups. */
	option: string | null;
	/** "Classic Cut · Skin Fade" style full name. */
	name: string;
	description: string | null;
	price: number;
	/** Seconds. */
	duration: number;
	image: string | null;
	/** Collection slug it's listed under on the menu. */
	section: string | null;
	/** Shops where it's offered, with the barbers who do it there. */
	shops: { id: string; slug: string; staffIds: string[] }[];
	cadenceDays: number | null;
}

export interface ServiceGroup {
	id: string;
	title: string;
	image: string | null;
	description: string | null;
	fromPrice: number;
	section: string | null;
	options: Service[];
}

export interface MenuSection {
	slug: string;
	sign: string;
	line: string;
	groups: ServiceGroup[];
}

export interface Barber {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	imageUrl: string | null;
	title: string;
	bio: string | null;
	years: number | null;
	known: string[];
	signature: string | null;
	uses: string[];
	quote: string | null;
	shops: { id: string; slug: string }[];
	/** Variant slugs they can be booked for. */
	services: string[];
}

export interface Shop {
	id: string;
	slug: string;
	title: string;
	short: string;
	addressLines: string[];
	lat: number | null;
	lng: number | null;
	area: string;
	tagline: string;
	note: string;
	transit: string;
	chairs: number;
	since: string;
	image: string;
	image2: string;
	barberIds: string[];
}

export interface ShelfItem {
	/** Add-on id (what the cart takes). */
	id: string;
	slug: string;
	title: string;
	description: string | null;
	price: number;
	image: string | null;
	maxQuantity: number | null;
	taxable: boolean;
	note: ShelfNote | null;
	/** Variant ids it can be added to (every service, in the sample store). */
	serviceIds: string[];
}

/** In-chair extras (hot towel finish, scalp massage…): add-ons that are not shelf products. */
export function isShelfSlug(slug: string | null | undefined): boolean {
	return !!slug && slug.startsWith(siteConfig.shelf.prefix);
}

export function toServices(products: ProductListItemResponse[], sectionOf: Record<string, string>): Service[] {
	const out: Service[] = [];
	for (const p of products) {
		const variants = p.variants?.length ? p.variants : [];
		const multi = variants.length > 1;
		for (const v of variants) {
			const staff = new Set((v.staffMembers ?? []).map((s) => s.id));
			const option = multi && v.variantTitle && v.variantTitle !== 'Default Title' ? v.variantTitle : null;
			const groupTitle = v.title || p.title;
			out.push({
				id: v.id,
				slug: v.slug,
				groupId: p.productId || p.id,
				groupTitle,
				option,
				name: option ? `${groupTitle} · ${option}` : groupTitle,
				description: v.description || null,
				price: v.price ?? 0,
				duration: v.duration ?? 0,
				image: v.image?.url ?? v.images?.[0]?.url ?? p.image?.url ?? null,
				section: sectionOf[v.slug] ?? v.collections?.[0]?.slug ?? null,
				shops: (v.locations ?? [])
					.filter((l) => l.type !== 'online')
					.map((l) => {
						const here = (l.staffMembers ?? []).map((s) => s.id).filter((id) => staff.has(id));
						return { id: l.id, slug: l.slug, staffIds: here.length > 0 ? here : [...staff] };
					}),
				cadenceDays: siteConfig.cadenceDays[v.slug] ?? null,
			});
		}
	}
	return out;
}

export function toGroups(services: Service[]): ServiceGroup[] {
	const map = new Map<string, ServiceGroup>();
	for (const s of services) {
		let g = map.get(s.groupId);
		if (!g) {
			g = { id: s.groupId, title: s.groupTitle, image: s.image, description: s.description, fromPrice: s.price, section: s.section, options: [] };
			map.set(s.groupId, g);
		}
		g.options.push(s);
		g.fromPrice = Math.min(g.fromPrice, s.price);
	}
	for (const g of map.values()) {
		g.options.sort((a, b) => compareOptions({ label: a.option, price: a.price, duration: a.duration }, { label: b.option, price: b.price, duration: b.duration }));
	}
	return [...map.values()];
}

/** Menu sections in `siteConfig.menu` order, then any collection the store adds, then "More" for the rest. */
export function toMenu(collections: ProductCollectionResponse[], services: Service[]): MenuSection[] {
	const groups = toGroups(services);
	const curated = Object.keys(siteConfig.menu);
	const sorted = [...collections]
		.filter((c) => c.isVisible !== false)
		.sort((a, b) => (curated.indexOf(a.slug) + 1 || 999) - (curated.indexOf(b.slug) + 1 || 999));
	const out: MenuSection[] = sorted.map((c) => ({
		slug: c.slug,
		sign: siteConfig.menu[c.slug]?.sign ?? c.title,
		line: siteConfig.menu[c.slug]?.line ?? c.description ?? '',
		groups: groups.filter((g) => g.section === c.slug),
	}));
	const rest = groups.filter((g) => !g.section || !sorted.some((c) => c.slug === g.section));
	if (rest.length) out.push({ slug: 'more', sign: 'More', line: '', groups: rest });
	return out.filter((s) => s.groups.length > 0);
}

export interface BarberSource {
	id: string;
	slug: string;
	firstName?: string | null;
	lastName?: string | null;
	image?: { url?: string | null } | null;
	products?: { slug: string }[] | null;
	locations?: { id: string; slug: string; type?: string | null }[] | null;
}

export function toBarber(s: BarberSource): Barber {
	const profile = siteConfig.barbers[s.slug];
	const firstName = s.firstName ?? '';
	return {
		id: s.id,
		slug: s.slug,
		name: [firstName, s.lastName].filter(Boolean).join(' '),
		firstName,
		imageUrl: s.image?.url ?? null,
		title: profile?.title ?? 'Barber',
		bio: profile?.bio ?? null,
		years: profile?.years ?? null,
		known: profile?.known ?? [],
		signature: profile?.signature ?? null,
		uses: profile?.uses ?? [],
		quote: profile?.quote ?? null,
		shops: (s.locations ?? []).filter((l) => l.type !== 'online').map((l) => ({ id: l.id, slug: l.slug })),
		services: [...new Set((s.products ?? []).map((p) => p.slug))],
	};
}

/** Curated barbers first (config order), then by name. */
export function sortBarbers(list: Barber[]): Barber[] {
	const order = Object.keys(siteConfig.barbers);
	return [...list].sort((a, b) => (order.indexOf(a.slug) + 1 || 999) - (order.indexOf(b.slug) + 1 || 999) || a.name.localeCompare(b.name));
}

export interface ShopSource {
	id: string;
	slug: string;
	title: string;
	addressLines: string[];
	latitude: number | null;
	longitude: number | null;
}

export function toShop(l: ShopSource, index: number, barbers: Barber[]): Shop {
	const meta = shopMeta(l.slug, index);
	return {
		id: l.id,
		slug: l.slug,
		title: l.title,
		short: meta.short || l.title.replace(new RegExp(`^${siteConfig.name}\\s*`), ''),
		addressLines: l.addressLines,
		lat: l.latitude,
		lng: l.longitude,
		area: meta.area,
		tagline: meta.tagline,
		note: meta.note,
		transit: meta.transit,
		chairs: meta.chairs,
		since: meta.since,
		image: meta.image,
		image2: meta.image2,
		barberIds: barbers.filter((b) => b.shops.some((s) => s.id === l.id)).map((b) => b.id),
	};
}

export function toShelf(addOns: AddOnListItemResponse[]): ShelfItem[] {
	const order = Object.keys(siteConfig.shelf.notes);
	return addOns
		.filter((a) => isShelfSlug(a.slug) && a.status !== 'inactive')
		.map((a) => ({
			id: a.id,
			slug: a.slug,
			title: a.title,
			description: a.description || null,
			price: a.price,
			image: a.image?.url ?? null,
			maxQuantity: a.maxQuantity ?? null,
			taxable: a.taxable !== false,
			note: siteConfig.shelf.notes[a.slug] ?? null,
			serviceIds: (a.products ?? []).map((p) => p.id),
		}))
		.sort((a, b) => (order.indexOf(a.slug) + 1 || 999) - (order.indexOf(b.slug) + 1 || 999));
}

/** Shelf items to suggest beside a service: its configured pairs first, then the rest. */
export function pairsFor(serviceSlug: string | null | undefined, shelf: ShelfItem[], limit = shelf.length): ShelfItem[] {
	const pairs = (serviceSlug && siteConfig.shelf.pairs[serviceSlug]) || [];
	const first = pairs.map((s) => shelf.find((i) => i.slug === s)).filter((i): i is ShelfItem => !!i);
	return [...first, ...shelf.filter((i) => !pairs.includes(i.slug))].slice(0, limit);
}

export interface BookLink {
	service?: string | null;
	shop?: string | null;
	barber?: string | null;
	/** Comma-separated shelf slugs to pre-fill the kit. */
	kit?: string | null;
}

/** The booking deep link (`/book?service=…&shop=…&barber=…&kit=…`). */
export function bookHref(opts: BookLink = {}): string {
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(opts)) if (v) params.set(k, v);
	const qs = params.toString();
	return `/book${qs ? `?${qs}` : ''}`;
}

/** "30 min", "1 hr", "1 hr 30". */
export function sittingLength(seconds: number): string {
	const mins = Math.round(seconds / 60);
	if (mins < 60) return `${mins} min`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m ? `${h} hr ${m}` : `${h} hr`;
}

/** "€45", "€42.50". */
export function money(amount: number, currency: string = siteConfig.currency): string {
	const whole = Number.isInteger(amount);
	return new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}
