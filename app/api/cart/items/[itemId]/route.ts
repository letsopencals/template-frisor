import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { revalidateAvailability } from '@/lib/availability-server';

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;

	try {
		const token = await getAccessToken();
		const { data } = await CartService.removeItem({ path: { itemId }, headers: { Authorization: `Bearer ${token ?? ''}` } });
		// A released hold frees its time again.
		revalidateAvailability();
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}
