import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Gloock, Schibsted_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/providers';
import { CounterBar } from '@/components/chrome/counter-bar';
import { EnamelSign } from '@/components/chrome/enamel-sign';
import { Colophon } from '@/components/chrome/colophon';
import { siteConfig } from '@/lib/site-config';
import { getStoreSettings } from '@/lib/server-data';
import { getCatalog } from '@/lib/catalog-server';
import { money } from '@/lib/catalog';
import type { BoardFacts } from '@/lib/nav';
import './globals.css';

const sign = Big_Shoulders({ subsets: ['latin'], weight: ['600', '700', '800', '900'], variable: '--font-sign-frisor', display: 'swap' });
const serif = Gloock({ subsets: ['latin'], weight: '400', variable: '--font-serif-frisor', display: 'swap' });
const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-sans-frisor', display: 'swap' });

export const viewport: Viewport = {
	themeColor: '#18211f',
	viewportFit: 'cover',
};

const title = `${siteConfig.name}: ${siteConfig.tagline}`;

export const metadata: Metadata = {
	title: { default: title, template: `%s · ${siteConfig.name}` },
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	openGraph: { title, description: siteConfig.description, siteName: siteConfig.name, locale: 'en_DE', type: 'website', images: [siteConfig.hero.image] },
	twitter: { card: 'summary_large_image', title, description: siteConfig.description },
	robots: { index: true, follow: true },
};

/*
 * Root layout: fonts, providers, the enamel sign on top, the page, the colophon and the
 * Counter bar fixed at the bottom (DESIGN.md). Body pads by the bar's height.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [initialSettings, catalog] = await Promise.all([getStoreSettings(), getCatalog()]);
	const from = catalog.services.length ? Math.min(...catalog.services.map((s) => s.price)) : null;
	const facts: BoardFacts = {
		'/menu': from !== null ? `from ${money(from, catalog.currency)}` : undefined,
		'/barbers': catalog.barbers.length ? `${catalog.barbers.length} chairs` : undefined,
		'/shops': catalog.shops.length ? `${catalog.shops.length} doors` : undefined,
		'/apothecary': catalog.shelf.length ? `${catalog.shelf.length} jars` : undefined,
		'/account': 'sign in',
	};

	return (
		<html lang="en" className={`${sign.variable} ${serif.variable} ${sans.variable}`} suppressHydrationWarning>
			<body>
				<a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[80] bg-towel px-4 py-2 text-ink">
					Skip to content
				</a>
				<Providers initialSettings={initialSettings}>
					<EnamelSign shops={catalog.shops.map((s) => s.short)} />
					<main id="main" className="min-h-[70svh]">
						{children}
					</main>
					<Colophon shops={catalog.shops} />
					<CounterBar facts={facts} />
				</Providers>
				<Analytics />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'HairSalon',
							name: siteConfig.legalName,
							description: siteConfig.description,
							url: siteConfig.url,
							telephone: siteConfig.contact.phone,
							email: siteConfig.contact.email,
							priceRange: '€€',
							department: catalog.shops.map((s) => ({
								'@type': 'BarberShop',
								name: s.title,
								address: { '@type': 'PostalAddress', streetAddress: s.addressLines[0], addressLocality: 'Berlin', addressCountry: 'DE' },
								...(s.lat !== null && s.lng !== null ? { geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng } } : {}),
							})),
						}),
					}}
				/>
			</body>
		</html>
	);
}
