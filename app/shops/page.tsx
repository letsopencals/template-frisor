import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/site/page-head';
import { ShopPanel } from '@/components/shops/shop-panel';

export const metadata: Metadata = { title: 'Shops', description: 'Frisør in Mitte, Kreuzberg and Prenzlauer Berg. Addresses, hours and how to get there.' };

/** /shops: the three shops as large photo panels. */
export default async function ShopsPage() {
	const c = await getCatalog();
	return (
		<>
			<PageHead kicker="The shops" title="Three doors in Berlin." line={`Same menu, same prices, same hot towels. ${siteConfig.contact.hours}.`} />
			<div className="mx-auto grid max-w-[1440px] gap-14 px-4 pb-24 sm:px-6 md:grid-cols-3 md:gap-8 lg:px-10">
				{c.shops.map((s) => (
					<ShopPanel key={s.id} shop={s} barberCount={s.barberIds.length} />
				))}
			</div>
		</>
	);
}
