import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';
import { withoutSecrets } from '@/lib/account-types';

export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await SelfService.getProfile({ headers: auth.headers, throwOnError: true });
		return NextResponse.json(withoutSecrets(publicPayload(data)));
	} catch (err) {
		return handleApiError(err);
	}
}

export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const raw = (await request.json()) as Record<string, unknown>;
		// Only the fields a patient may edit; email changes go through the clinic.
		const body: { firstName?: string; lastName?: string; phone?: string } = {};
		for (const k of ['firstName', 'lastName', 'phone'] as const) if (typeof raw[k] === 'string') body[k] = (raw[k] as string).trim();
		const { data } = await SelfService.updateProfile({ body, headers: auth.headers, throwOnError: true });
		return NextResponse.json(withoutSecrets(publicPayload(data)));
	} catch (err) {
		return handleApiError(err);
	}
}
