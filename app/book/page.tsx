import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { BookView } from '@/components/book/book-view';

export const metadata: Metadata = { title: 'Book a chair', description: 'Book your shop, your barber and the time at Frisør, Berlin. Add something from the shelf and it waits at the chair.' };

type Search = { service?: string; shop?: string; barber?: string; kit?: string };

export default async function BookPage({ searchParams }: { searchParams: Promise<Search> }) {
	const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
	return (
		<BookView
			services={catalog.services}
			barbers={catalog.barbers}
			shops={catalog.shops}
			shelf={catalog.shelf}
			sections={catalog.menu.map((m) => ({ slug: m.slug, sign: m.sign }))}
			currency={catalog.currency}
			initial={{ service: sp.service, shop: sp.shop, barber: sp.barber, kit: sp.kit }}
		/>
	);
}
