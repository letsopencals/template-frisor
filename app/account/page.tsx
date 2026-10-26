import { getCatalog } from '@/lib/catalog-server';
import { VisitsView } from '@/components/account/visits-view';

export default async function AccountPage() {
	const c = await getCatalog();
	return <VisitsView shelf={c.shelf} shops={c.shops.map((s) => ({ id: s.id, short: s.short }))} currency={c.currency} />;
}
