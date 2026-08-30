import type { MetadataRoute } from 'next';
import type { ProductListItemResponse, ProductListVariant } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;

	const staticRoutes: MetadataRoute.Sitemap = [
		{url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1},
		{url: `${base}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9},
		{url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7},
		{url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7},
	];

	try {
		const { data: response } = await ProductService.list({ query: { take: 50 } });
		const products: ProductListItemResponse[] = response?.data ?? [];
		const productRoutes: MetadataRoute.Sitemap = products
		.flatMap((p) => p.variants ?? [])
		.map((variant: ProductListVariant) => ({
			url: `${base}/booking/${variant.slug}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.8,
		}));
		return [...staticRoutes, ...productRoutes];
	} catch {
		// SDK not available — return static routes only
	}

	return staticRoutes;
}
