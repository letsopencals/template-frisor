import '@/lib/opencals';
import { InvoiceService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { toAccountInvoice } from '@/lib/account-types';

/** Invoices and receipts issued for one of the patient's orders (drafts hidden). */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	const { orderId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await InvoiceService.list({ path: { orderId }, headers: auth.headers, throwOnError: true });
		return NextResponse.json((data ?? []).filter((i) => i.status !== 'draft').map(toAccountInvoice));
	} catch (err) {
		return handleApiError(err);
	}
}
