import '@/lib/opencals';
import { AppointmentService, type AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';
import { toSitting } from '@/lib/sittings-server';
import type { SittingRecord } from '@/lib/sittings';

/** Most recent sittings loaded into the account (details are fetched one by one). */
const CAP = 30;

/**
 * The signed-in customer's sittings, newest first, each mapped to a public-safe `Sitting`
 * (service, barber, shop, shelf lines and charge). Feeds the regular's card, the cadence line
 * and "your shelf".
 */
export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data: list } = await AppointmentService.list({
			query: { take: CAP, page: 1, orderBy: 'from', order: 'DESC' },
			headers: auth.headers,
			throwOnError: true,
		});
		const items = list?.data ?? [];
		const total = (list?.meta as { total?: number } | undefined)?.total ?? items.length;
		const details = await Promise.all(
			items.map(async (item) => {
				try {
					const { data } = await AppointmentService.find({ path: { appointmentId: item.id }, headers: auth.headers });
					return (data as AppointmentDetailResponse | undefined) ?? null;
				} catch {
					return null;
				}
			}),
		);
		const sittings = details
			.filter((d): d is AppointmentDetailResponse => !!d)
			.map(toSitting)
			.sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
		const body: SittingRecord = { sittings, truncated: total > items.length };
		return NextResponse.json(body);
	} catch (err) {
		return handleApiError(err);
	}
}
