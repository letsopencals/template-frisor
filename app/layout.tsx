import type { Metadata, Viewport } from 'next';
import { Libre_Caslon_Display, Libre_Caslon_Text, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { siteConfig } from '@/lib/site-config';
import { getStoreSettings } from '@/lib/server-data';
import { getCatalog } from '@/lib/catalog-server';
import './globals.css';

const display = Libre_Caslon_Display({ subsets: ['latin'], weight: '400', variable: '--font-display-frisor', display: 'swap' });
const serif = Libre_Caslon_Text({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-serif-frisor', display: 'swap' });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans-frisor', display: 'swap' });

export const viewport: Viewport = {
	themeColor: '#f3eee4',
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

/** Root layout: fonts, providers, the sticky paper header, the page and the green footer (DESIGN.md). */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [initialSettings, catalog] = await Promise.all([getStoreSettings(), getCatalog()]);

	return (
		<html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`} suppressHydrationWarning>
			<body>
				<a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[80] bg-paper px-4 py-2 text-ink">
					Skip to content
				</a>
				<Providers initialSettings={initialSettings}>
					<SiteHeader shops={catalog.shops.map((s) => ({ slug: s.slug, short: s.short }))} />
					<main id="main" className="min-h-[70svh]">
						{children}
					</main>
					<SiteFooter shops={catalog.shops} />
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
