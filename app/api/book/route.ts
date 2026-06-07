import '@/lib/opencals';
import { AppointmentService, CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

interface AddOnSelection {
	addOnId: string;
	quantity?: number;
}

interface QuestionAnswerInput {
	questionId: string;
	question: string;
	answer: string;
}

interface CustomerInput {
	kind: 'new' | 'existing';
	customerId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
}

export async function POST(request: NextRequest) {
	const cartIdHeader = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const { slot, numberOfAttendees, addOns, customer, checkoutQuestionAnswers } = body as {
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
		};

		if (!slot?.productId || !slot?.fromDate || !slot?.fromTime || !slot?.toDate || !slot?.toTime) {
			return NextResponse.json({ error: 'Invalid slot data' }, { status: 400 });
		}

		const token = await getAccessToken();
		const authHeaders = { Authorization: `Bearer ${token ?? ''}` };

		const { data: cart } = await CartService.createOrGet({
			headers: { ...authHeaders, 'X-Cart-Id': cartIdHeader },
			throwOnError: true,
		});

		const { data: appointment } = await AppointmentService.create({
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
					.map((a) => ({
						addOnId: a.addOnId,
						...(typeof a.quantity === 'number' ? { quantity: a.quantity } : {}),
					})),
				...(customer
				? {
						customer:
							customer.kind === 'existing' && customer.customerId
								? { customerId: customer.customerId }
								: { externalId: customer.email ?? '', email: customer.email ?? '', firstName: customer.firstName, lastName: customer.lastName },
					}
				: {}),
				...(checkoutQuestionAnswers && checkoutQuestionAnswers.length > 0
					? { checkoutQuestionAnswers }
					: {}),
			},
			headers: authHeaders,
			throwOnError: true,
		});

		const { data: finalCart } = await CartService.get({
			headers: { ...authHeaders, 'X-Cart-Id': cart.id },
			throwOnError: true,
		});

		return NextResponse.json({ appointment, cart: finalCart });
	} catch (err) {
		return handleApiError(err);
	}
}
