import { getCatalog } from '@/lib/catalog-server';
import { WindowHero } from '@/components/home/window-hero';
import { MenuCard } from '@/components/home/menu-card';
import { BarberRow } from '@/components/home/barber-row';
import { ShelfTeaser } from '@/components/home/shelf-teaser';
import { HouseRules } from '@/components/home/house-rules';
import { ShopDoors } from '@/components/home/shop-doors';
import type { ChairsShop } from '@/components/home/chairs-today';

export const revalidate = 300;

/** The everyday cut, probed for "next chair" on the window board. */
const PROBE_SLUG = 'classic-cut-standard';

export default async function HomePage() {
	const catalog = await getCatalog();
	const probeService = catalog.services.find((s) => s.slug === PROBE_SLUG) ?? catalog.services[0];
	const probe: ChairsShop[] = probeService
		? probeService.shops.map((s) => ({ locationId: s.id, variantId: probeService.id, serviceSlug: probeService.slug }))
		: [];

	return (
		<>
			<WindowHero shops={catalog.shops} probe={probe} />
			<MenuCard menu={catalog.menu} currency={catalog.currency} />
			<BarberRow barbers={catalog.barbers} shops={catalog.shops} />
			<ShelfTeaser shelf={catalog.shelf} currency={catalog.currency} />
			<HouseRules />
			<ShopDoors shops={catalog.shops} />
		</>
	);
}
