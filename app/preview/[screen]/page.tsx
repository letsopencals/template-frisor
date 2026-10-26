import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { fixtureSittings } from '@/lib/preview-fixtures';
import { ConfirmationBody } from '@/components/confirmation/confirmation-body';
import { VisitsBody } from '@/components/account/visits-view';

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

const SCREENS = ['thank-you', 'account'] as const;

/**
 * Post-booking screens rendered from fixtures (real catalogue, no customer), for design review and
 * screenshots: /preview/thank-you, /preview/account.
 */
export default async function PreviewPage({ params }: { params: Promise<{ screen: string }> }) {
	const { screen } = await params;
	if (!SCREENS.includes(screen as (typeof SCREENS)[number])) notFound();
	const c = await getCatalog();
	const sittings = fixtureSittings(c);
	const shops = c.shops.map((s) => ({ id: s.id, slug: s.slug, short: s.short, transit: s.transit }));
	const first = sittings[0]!;
	const total = first.service.price + first.lines.reduce((n, l) => n + l.unitPrice * l.quantity * 0.85, 0);

	return (
		<>
			<p className="bg-brass-hi/40 px-4 py-2 text-center text-xs text-ink-2">
				Preview with sample data · <Link href="/preview/thank-you" className="link">thank-you</Link> · <Link href="/preview/account" className="link">account</Link>
			</p>
			{screen === 'thank-you' ? (
				<ConfirmationBody sittings={[first]} shops={shops} shelf={c.shelf} total={Math.round(total * 100) / 100} currency={c.currency} />
			) : (
				<div className="mx-auto max-w-[1200px] px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-16">
					<p className="label text-brass-lo">Your account</p>
					<h1 className="display mt-2 text-[2.6rem] leading-none sm:text-6xl">Hello, Max.</h1>
					<div className="mt-8 border-b border-paper-3" />
					<div className="pt-8">
						<VisitsBody sittings={sittings} shelf={c.shelf} shops={shops} currency={c.currency} now={Date.now()} />
					</div>
				</div>
			)}
		</>
	);
}
