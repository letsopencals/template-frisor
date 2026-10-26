import { cache } from 'react';
import { getAddOns, getBarbers, getCollections, getLocations, getProducts, getSectionIndex, getStoreSettings } from '@/lib/server-data';
import { toMenu, toServices, toShelf, toShop, type Barber, type MenuSection, type Service, type ShelfItem, type Shop } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

/**
 * Everything the pages render, from one set of cached SDK reads per request: services, the menu,
 * barbers, shops and the shelf. Server-only; pass slices of it to client components as props.
 */
export interface Catalog {
	services: Service[];
	menu: MenuSection[];
	barbers: Barber[];
	shops: Shop[];
	shelf: ShelfItem[];
	/** In-chair extras (non-shelf add-ons), for the menu page. */
	extras: { id: string; slug: string; title: string; description: string | null; price: number }[];
	currency: string;
	timeZone: string;
}

export const getCatalog = cache(async (): Promise<Catalog> => {
	const [products, collections, sectionOf, barbers, locations, addOns, settings] = await Promise.all([
		getProducts(),
		getCollections(),
		getSectionIndex(),
		getBarbers(),
		getLocations(),
		getAddOns(),
		getStoreSettings(),
	]);
	const services = toServices(products, sectionOf);
	const shopOrder = Object.keys(siteConfig.shops);
	const shops = locations
		.filter((l) => l.type === 'physical')
		.sort((a, b) => (shopOrder.indexOf(a.slug) + 1 || 999) - (shopOrder.indexOf(b.slug) + 1 || 999))
		.map((l, i) => toShop({ id: l.id, slug: l.slug, title: l.title, addressLines: l.addressLines, latitude: l.latitude, longitude: l.longitude }, i, barbers));
	const shelf = toShelf(addOns);
	const shelfIds = new Set(shelf.map((s) => s.id));
	return {
		services,
		menu: toMenu(collections, services),
		barbers,
		shops,
		shelf,
		extras: addOns
			.filter((a) => !shelfIds.has(a.id) && (a.products?.length ?? 0) > 0)
			.map((a) => ({ id: a.id, slug: a.slug, title: a.title, description: a.description || null, price: a.price })),
		currency: settings?.currency || siteConfig.currency,
		timeZone: settings?.settings?.timezone || siteConfig.timeZone,
	};
});
