import type { FeedbackQuestionResponse, InvoiceResponse } from '@opencals/storefront-sdk';

/**
 * Small public-safe shapes the account API routes return (client-safe, no SDK calls).
 */

export interface AccountInvoice {
	id: string;
	number: string;
	kind: 'collectible' | 'receipt';
	status: 'draft' | 'sent' | 'paid' | 'void' | 'failed';
	amountDue: number;
	currency: string;
	issuedAt: string | null;
	dueAt: string | null;
	paidAt: string | null;
	/** Hosted invoice / receipt page, when the provider has one. */
	url: string | null;
}

export interface AccountFeedbackQuestion {
	id: string;
	type: FeedbackQuestionResponse['type'];
	required: boolean;
	title: string;
	description: string | null;
	options: string[];
}

export type ConsentState = 'not_subscribed' | 'subscribed' | 'unsubscribed';

export interface AccountConsent {
	email: ConsentState;
	sms: ConsentState;
	whatsapp: ConsentState;
}

export function toAccountInvoice(i: InvoiceResponse): AccountInvoice {
	const raw = i as InvoiceResponse & { issuedAt?: string | null; dueAt?: string | null; paidAt?: string | null };
	return {
		id: i.id,
		number: i.number,
		kind: i.kind,
		status: i.status,
		amountDue: i.amountDue,
		currency: i.currencyCode,
		issuedAt: raw.issuedAt ?? null,
		dueAt: raw.dueAt ?? null,
		paidAt: raw.paidAt ?? null,
		url: i.externalUrl || null,
	};
}

/** Strip the customer's password hash and tokens from any payload that nests a customer. */
export function withoutSecrets<T>(payload: T): T {
	const walk = (v: unknown): unknown => {
		if (Array.isArray(v)) return v.map(walk);
		if (!v || typeof v !== 'object') return v;
		const out: Record<string, unknown> = {};
		for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
			if (k === 'password' || k === 'refreshToken') continue;
			out[k] = walk(val);
		}
		return out;
	};
	return walk(payload) as T;
}
