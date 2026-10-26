import '@/lib/opencals';
import { ProductCollectionService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;

	try {
		const { data } = await ProductCollectionService.getBySlug({ path: { slug } });
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}
