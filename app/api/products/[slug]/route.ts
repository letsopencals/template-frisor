import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

/**
 * Returns the full product (with variants, staff, and locations) for a given slug.
 *
 * The booking flow needs each variant's `staffMembers` (with their `locations`) and
 * `locations` — that richer shape lives on the list response (`ProductListItemResponse`),
 * not the leaner `getBySlug` detail. So we fetch the catalog and return the group that
 * owns the requested slug (either the group's own slug or one of its variant slugs).
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	try {
		const { data } = await ProductService.list({ query: { take: 100 } });
		const items = data?.data ?? [];
		const match = items.find(
			(item) => item.slug === slug || item.variants?.some((variant) => variant.slug === slug),
		);

		if (!match) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		return NextResponse.json(publicPayload(match));
	} catch (err) {
		return handleApiError(err);
	}
}
