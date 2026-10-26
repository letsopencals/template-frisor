import '@/lib/opencals';
import { AppointmentService, CartService, CheckoutService, OpencalsApiError } from '@opencals/storefront-sdk';
import type { CartResponse } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { revalidateAvailability } from '@/lib/availability-server';

interface AddOnSelection {
	addOnId: string;
	/** Omitted for `durationMultiplied` add-ons (the backend prices them × booked units). */
	quantity?: number;
}

interface QuestionAnswerInput {
	questionId: string;
	question: string;
	answer: string;
	/** Ids from /api/uploads/presign, for file-upload questions. */
	fileIds?: string[];
}

interface CustomerInput {
	kind: 'new' | 'existing';
	customerId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
}

interface BookInput {
	slot: {
		productId: string;
		fromDate: string;
		fromTime: string;
		toDate: string;
		toTime: string;
		staffMemberId?: string | null;
		locationId?: string | null;
	};
	numberOfAttendees?: number;
	addOns?: AddOnSelection[];
	customer?: CustomerInput;
	checkoutQuestionAnswers?: QuestionAnswerInput[];
	/**
	 * Cart item from an earlier attempt in the same composer (the patient
	 * changed the visit after reserving). Removed first so its pending hold
	 * doesn't block the new slot.
	 */
	replaceItemId?: string | null;
}

function sanitizeAnswers(input: unknown): QuestionAnswerInput[] {
	if (!Array.isArray(input)) return [];
	return input
		.filter((a): a is QuestionAnswerInput => !!a && typeof a.questionId === 'string' && typeof a.answer === 'string')
		.map((a) => {
			const fileIds = Array.isArray(a.fileIds) ? a.fileIds.filter((id): id is string => typeof id === 'string' && !!id) : [];
			return {
				questionId: a.questionId,
				question: typeof a.question === 'string' ? a.question : '',
				answer: a.answer,
				...(fileIds.length > 0 ? { fileIds } : {}),
			};
		});
}

/** Slot conflicts read better as one calm sentence than the backend's wording. */
function friendlySlotError(err: unknown): NextResponse | null {
	if (!(err instanceof OpencalsApiError)) return null;
	const msg = err.message.toLowerCase();
	const isSlotConflict =
		err.status === 409 ||
		msg.includes('not available') ||
		msg.includes('availability') ||
		msg.includes('already booked') ||
		msg.includes('maximum attendees');
	if (!isSlotConflict) return null;
	return NextResponse.json(
		{ error: 'That time was just taken by someone else. Please choose another time.', code: 'slot_unavailable' },
		{ status: 409 },
	);
}

/**
 * Hold one visit in the cart:
 *   1. create/get the cart (`X-Cart-Id`)
 *   2. drop the item from an earlier attempt (`replaceItemId`)
 *   3. create the appointment with its add-ons and all answers incl. `fileIds`
 *      (stored per appointment, so a family cart keeps each visit's "Visit for",
 *      patient details and photos apart)
 *   4. legacy fallback: re-link files via `CheckoutService.saveAnswers`, only when
 *      this is the cart's sole visit
 *
 * Response: { appointment, cart, itemId }. If step 4 fails the visit is already
 * held, so the error response still carries { cart, itemId } and the client
 * passes `replaceItemId` on retry.
 */
export async function POST(request: NextRequest) {
	const cartIdHeader = request.headers.get('X-Cart-Id') ?? '';

	let body: BookInput;
	try {
		body = (await request.json()) as BookInput;
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { slot, numberOfAttendees, addOns, customer, replaceItemId } = body;
	if (!slot?.productId || !slot?.fromDate || !slot?.fromTime || !slot?.toDate || !slot?.toTime) {
		return NextResponse.json({ error: 'Invalid slot data' }, { status: 400 });
	}

	const token = await getAccessToken();
	const authHeaders = { Authorization: `Bearer ${token ?? ''}` };
	const answers = sanitizeAnswers(body.checkoutQuestionAnswers);
	const fileAnswers = answers.filter((a) => a.fileIds);

	let cart: CartResponse;
	try {
		const res = await CartService.createOrGet({ headers: { ...authHeaders, 'X-Cart-Id': cartIdHeader }, throwOnError: true });
		cart = res.data;
	} catch (err) {
		return handleApiError(err);
	}

	if (replaceItemId && cart.items?.some((i) => i.id === replaceItemId)) {
		try {
			await CartService.removeItem({ path: { itemId: replaceItemId }, headers: { ...authHeaders, 'X-Cart-Id': cart.id }, throwOnError: true });
		} catch {
			// Already gone (expired hold) — carry on with the new booking.
		}
	}

	let appointmentId: string;
	let appointment: unknown;
	try {
		const res = await AppointmentService.create({
			body: {
				slot: {
					productId: slot.productId,
					fromDate: slot.fromDate,
					fromTime: slot.fromTime,
					toDate: slot.toDate,
					toTime: slot.toTime,
					staffMemberId: slot.staffMemberId ?? null,
					locationId: slot.locationId ?? null,
				},
				numberOfAttendees: numberOfAttendees ?? 1,
				cartId: cart.id,
				addOns: (addOns ?? [])
					.filter((a) => a?.addOnId)
					.map((a) => ({ addOnId: a.addOnId, ...(typeof a.quantity === 'number' ? { quantity: a.quantity } : {}) })),
				...(customer
					? {
							customer:
								customer.kind === 'existing' && customer.customerId
									? { customerId: customer.customerId }
									: { externalId: customer.email ?? '', email: customer.email ?? '', firstName: customer.firstName, lastName: customer.lastName },
						}
					: {}),
				...(answers.length > 0 ? { checkoutQuestionAnswers: answers } : {}),
			},
			headers: authHeaders,
			throwOnError: true,
		});
		appointment = res.data;
		appointmentId = res.data.id;
		// The held time is no longer free: drop the cached windows for this treatment.
		revalidateAvailability(slot.productId);
	} catch (err) {
		const friendly = friendlySlotError(err);
		if (friendly) revalidateAvailability(slot.productId);
		return friendly ?? handleApiError(err);
	}

	const loadCart = async () => (await CartService.get({ headers: { ...authHeaders, 'X-Cart-Id': cart.id }, throwOnError: true })).data;

	// Backends before the per-appointment file fix drop `fileIds` on create; re-link them through the
	// cart-wide save, but only when this is the cart's sole visit so another patient's answers are
	// never overwritten. On current backends this is an idempotent upsert of the same answer.
	const soleVisit = !(cart.items ?? []).some((i) => i.appointmentId && i.appointmentId !== appointmentId && i.id !== replaceItemId);
	if (fileAnswers.length > 0 && soleVisit) {
		try {
			await CheckoutService.saveAnswers({
				body: { answers: fileAnswers },
				headers: { ...authHeaders, 'X-Cart-Id': cart.id },
				throwOnError: true,
			});
		} catch (err) {
			const errorResponse = handleApiError(err, 'Could not attach your files');
			const errorBody = (await errorResponse.json()) as Record<string, unknown>;
			const finalCart = await loadCart().catch(() => cart);
			const itemId = finalCart.items?.find((i) => i.appointmentId === appointmentId)?.id ?? null;
			return NextResponse.json(
				{ ...errorBody, error: `Your visit is held, but your files didn’t attach: ${String(errorBody.error)}`, code: 'files_not_saved', cart: finalCart, itemId },
				{ status: errorResponse.status },
			);
		}
	}

	try {
		const finalCart = await loadCart();
		const itemId = finalCart.items?.find((i) => i.appointmentId === appointmentId)?.id ?? null;
		return NextResponse.json({ appointment, cart: finalCart, itemId });
	} catch (err) {
		return handleApiError(err);
	}
}
