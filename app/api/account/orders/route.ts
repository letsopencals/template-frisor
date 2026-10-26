import '@/lib/opencals';
import { OrderService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';
import { withoutSecrets } from '@/lib/account-types';

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	const { searchParams } = request.nextUrl;
	const take = Math.min(100, Number(searchParams.get('take') ?? '20') || 20);
	const page = Number(searchParams.get('page') ?? '1') || 1;

	try {
		const { data } = await OrderService.list({
			query: { take, page },
			headers: auth.headers,
			throwOnError: true,
		});
		return NextResponse.json(withoutSecrets(publicPayload(data)));
	} catch (err) {
		return handleApiError(err);
	}
}
