import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const productId = searchParams.get('productId');
	const date = searchParams.get('date');
	const timezone = searchParams.get('timezone') ?? undefined;
	const staffMemberId = searchParams.get('staffMemberId') ?? undefined;
	const locationId = searchParams.get('locationId') ?? undefined;
	const excludeAppointmentId = searchParams.get('excludeAppointmentId') ?? undefined;

	if (!productId || !date) {
		return NextResponse.json({ error: 'productId and date are required' }, { status: 400 });
	}

	try {
		const { data } = await ProductService.getCurrentAvailabilities({
			path: { productId },
			// `excludeAppointmentId` (rescheduling) is accepted by the API but not yet typed in this SDK version
			query: { date, timezone, staffMemberId, locationId, ...(excludeAppointmentId && { excludeAppointmentId }) },
			throwOnError: true,
		});
		return NextResponse.json(data ?? []);
	} catch (err) {
		return handleApiError(err);
	}
}
