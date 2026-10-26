'use client';

import useSWR from 'swr';
import type { CheckoutQuestionResponse as CheckoutQuestion } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';

/**
 * Checkout questions for a product, keyed by variant slug. Split out of
 * use-booking-flow so the flow hook orchestrates rather than fetches.
 * `fallback` seeds SWR with server-rendered questions (only pass it for the
 * slug it was fetched for).
 */
export function useCheckoutQuestions(slug: string | null, fallback?: CheckoutQuestion[]): CheckoutQuestion[] {
	const { data } = useSWR<CheckoutQuestion[]>(slug ? `/api/products/${slug}/questions?language=en` : null, fetcher, {
		revalidateOnFocus: false,
		...(fallback ? { fallbackData: fallback } : {}),
	});
	return Array.isArray(data) ? data : [];
}

/** The visible (English) title of a question, falling back to its internal name. */
export function questionTitle(q: CheckoutQuestion): string {
	return q.translations?.[0]?.title || q.internalName;
}

/** The question's helper text, if any. */
export function questionDescription(q: CheckoutQuestion): string | null {
	return q.translations?.[0]?.description || null;
}

/** Options for dropdown / multi-option checkbox questions. */
export function questionOptions(q: CheckoutQuestion): string[] {
	const options = q.translations?.[0]?.options;
	return Array.isArray(options) ? options.filter((o): o is string => typeof o === 'string' && !!o) : [];
}
