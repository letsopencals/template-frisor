import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { PageSign } from '@/components/ui/page-sign';
import { DoorRow } from '@/components/shops/door-row';

export const revalidate = 300;
export const metadata: Metadata = { title: 'The shops', description: 'Frisør in Mitte, Kreuzberg and Prenzlauer Berg: addresses, hours, transit and who cuts where.' };

export default async function ShopsPage() {
	const { shops, barbers } = await getCatalog();
	return (
		<>
			<PageSign kicker="Three doors in Berlin" title="The shops" line="Same menu and the same prices in every shop. Walk in, or better, book the minute." />
			<div className="mx-auto max-w-[1600px] px-5 sm:px-8">
				{shops.map((s, i) => (
					<DoorRow key={s.id} shop={s} index={i} barbers={barbers} />
				))}
			</div>
		</>
	);
}
