import type { Metadata } from 'next';
import { CheckoutProvider } from '@/contexts/checkout-context';
import { getCatalog } from '@/lib/catalog-server';
import { CheckoutView } from '@/components/checkout/checkout-view';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default async function CheckoutPage() {
	const { shelf } = await getCatalog();
	return (
		<CheckoutProvider>
			<CheckoutView shelf={shelf} />
		</CheckoutProvider>
	);
}
