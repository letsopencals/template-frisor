export const BOOKING_STEPS = ['when', 'who', 'extras', 'questions', 'details', 'payment'] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

export const STEP_LABELS: Record<BookingStep, string> = {
	when: 'When',
	who: 'Who',
	extras: 'Extras',
	questions: 'Questions',
	details: 'Your details',
	payment: 'Payment',
};
