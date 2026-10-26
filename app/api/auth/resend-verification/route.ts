import '@/lib/opencals';
import { AuthService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';

/** Re-sends the account verification email. Always 204 (no account enumeration). */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as { email?: unknown };
		const email = typeof body.email === 'string' ? body.email.trim() : '';
		if (email) await AuthService.requestEmailVerification({ body: { email } });
	} catch {
		// Swallowed on purpose.
	}
	return new NextResponse(null, { status: 204 });
}
