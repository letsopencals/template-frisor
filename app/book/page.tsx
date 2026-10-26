import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { BookView } from '@/components/book/book-view';

export const metadata: Metadata = { title: 'Take a chair', description: 'Book your barber, your shop and the minute at Frisør, Berlin. Add your pomade and it waits at the chair.' };

type Search = { service?: string; shop?: string; barber?: string; kit?: string };

export default async function BookPage({ searchParams }: { searchParams: Promise<Search> }) {
	const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
	return (
		<>
			<header className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-4 px-5 pt-10 sm:px-8">
				<h1 className="sign gilt text-[clamp(3rem,8vw,6rem)] font-black leading-[0.85]">Take a chair</h1>
				<p className="max-w-md text-sm text-towel/70">Pick the cut, the shop and the barber, then the minute on the mirror. Add anything from the shelf and it waits at your station.</p>
			</header>
			<BookView services={catalog.services} barbers={catalog.barbers} shops={catalog.shops} currency={catalog.currency} initial={{ service: sp.service, shop: sp.shop, barber: sp.barber, kit: sp.kit }} />
		</>
	);
}
