import type { Metadata } from 'next';
import { CheckoutProvider } from '@/contexts/checkout-context';
import { getCatalog } from '@/lib/catalog-server';
import { DocketView } from '@/components/checkout/docket-view';

export const metadata: Metadata = { title: 'The docket', robots: { index: false, follow: false } };

export default async function CheckoutPage() {
	const { shelf } = await getCatalog();
	return (
		<CheckoutProvider>
			<DocketView shelf={shelf} />
		</CheckoutProvider>
	);
}
