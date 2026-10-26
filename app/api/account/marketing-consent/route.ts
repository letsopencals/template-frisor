import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import type { AccountConsent } from '@/lib/account-types';

function toConsent(data: { emailState?: string; smsState?: string; whatsappState?: string } | null | undefined): AccountConsent {
	return {
		email: (data?.emailState as AccountConsent['email']) ?? 'not_subscribed',
		sms: (data?.smsState as AccountConsent['sms']) ?? 'not_subscribed',
		whatsapp: (data?.whatsappState as AccountConsent['whatsapp']) ?? 'not_subscribed',
	};
}

/** The patient's communication preferences, per channel. */
export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await SelfService.getMarketingConsent({ headers: auth.headers, throwOnError: true });
		return NextResponse.json(toConsent(data));
	} catch (err) {
		return handleApiError(err);
	}
}

/** `{ email?: boolean, sms?: boolean, whatsapp?: boolean }` — only the channels sent change. */
export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const raw = (await request.json()) as Record<string, unknown>;
		const body: { email?: boolean; sms?: boolean; whatsapp?: boolean } = {};
		for (const k of ['email', 'sms', 'whatsapp'] as const) if (typeof raw[k] === 'boolean') body[k] = raw[k] as boolean;
		const { data } = await SelfService.updateMarketingConsent({ body, headers: auth.headers, throwOnError: true });
		return NextResponse.json(toConsent(data));
	} catch (err) {
		return handleApiError(err);
	}
}
