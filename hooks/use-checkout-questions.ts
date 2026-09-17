'use client';

import useSWR from 'swr';
import type { CheckoutQuestionResponse as CheckoutQuestion } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';

/**
 * Checkout questions for a product, keyed by slug. Split out of use-booking-flow
 * so the flow hook orchestrates rather than fetches.
 */
export function useCheckoutQuestions(slug: string | null): CheckoutQuestion[] {
	const { data } = useSWR<CheckoutQuestion[]>(
		slug ? `/api/products/${slug}/questions?language=en` : null,
		fetcher,
		{ revalidateOnFocus: false },
	);
	return Array.isArray(data) ? data : [];
}
