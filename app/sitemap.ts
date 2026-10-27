import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getCatalog } from '@/lib/catalog-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${base}${path}`, lastModified: now, changeFrequency: 'weekly', priority });
	const out = [page('', 1), page('/book', 0.9), page('/services', 0.9), page('/barbers', 0.8), page('/shops', 0.8), page('/shelf', 0.8)];
	try {
		const c = await getCatalog();
		out.push(...c.barbers.map((b) => page(`/barbers/${b.slug}`, 0.6)), ...c.shops.map((s) => page(`/shops/${s.slug}`, 0.7)));
	} catch {
		// Store unreachable: static pages only.
	}
	return out;
}
