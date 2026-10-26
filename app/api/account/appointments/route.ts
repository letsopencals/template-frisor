import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';
import { withoutSecrets } from '@/lib/account-types';

const ORDER_BY = new Set(['from', 'to', 'createdAt']);

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	const { searchParams } = request.nextUrl;
	const take = Math.min(100, Number(searchParams.get('take') ?? '20') || 20);
	const page = Number(searchParams.get('page') ?? '1') || 1;
	const orderByRaw = searchParams.get('orderBy');
	const orderBy = orderByRaw && ORDER_BY.has(orderByRaw) ? (orderByRaw as 'from' | 'to' | 'createdAt') : undefined;
	const order = searchParams.get('order') === 'ASC' ? 'ASC' : searchParams.get('order') === 'DESC' ? 'DESC' : undefined;

	try {
		const { data } = await AppointmentService.list({
			query: { take, page, ...(orderBy ? { orderBy } : {}), ...(order ? { order } : {}) },
			headers: auth.headers,
			throwOnError: true,
		});
		return NextResponse.json(withoutSecrets(publicPayload(data)));
	} catch (err) {
		return handleApiError(err);
	}
}
