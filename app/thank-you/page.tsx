import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { ThankYouView } from '@/components/confirmation/thank-you-view';

export const metadata: Metadata = { title: 'You’re booked in', robots: { index: false, follow: false } };

export default async function ThankYouPage() {
	const { shops, shelf } = await getCatalog();
	return (
		<Suspense fallback={<div className="min-h-[60svh]" aria-busy="true" />}>
			<ThankYouView shops={shops.map((s) => ({ id: s.id, slug: s.slug, short: s.short, transit: s.transit }))} shelf={shelf} />
		</Suspense>
	);
}
