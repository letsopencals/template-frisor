import '@/lib/opencals';
import { AppointmentService, FeedbackQuestionService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import type { AccountFeedbackQuestion } from '@/lib/account-types';

type Params = { params: Promise<{ appointmentId: string }> };

/** The visit's feedback questions ("Rate your care"), resolved from its own product. */
export async function GET(_request: NextRequest, { params }: Params) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data: appt } = await AppointmentService.find({ path: { appointmentId }, headers: auth.headers, throwOnError: true });
		const productId = appt.product?.id;
		if (!productId) return NextResponse.json([]);
		const { data } = await FeedbackQuestionService.listTranslations({ path: { productId, language: 'en' }, throwOnError: true });
		const out: AccountFeedbackQuestion[] = (data ?? [])
			.slice()
			.sort((a, b) => a.order - b.order)
			.filter((q) => q.type !== 'file-upload')
			.map((q) => {
				const t = q.translations?.[0];
				return {
					id: q.id,
					type: q.type,
					required: q.required,
					title: t?.title ?? q.internalName,
					description: t?.description || null,
					options: t?.options ?? [],
				};
			});
		return NextResponse.json(out);
	} catch (err) {
		return handleApiError(err);
	}
}

/** Submit answers: `{ answers: [{ questionId, question, answer }] }`. */
export async function POST(request: NextRequest, { params }: Params) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const body = (await request.json()) as { answers?: { questionId?: unknown; question?: unknown; answer?: unknown }[] };
		const answers = (body.answers ?? [])
			.filter((a) => typeof a.questionId === 'string' && typeof a.question === 'string')
			.map((a) => ({
				questionId: a.questionId as string,
				question: a.question as string,
				answer: typeof a.answer === 'string' ? a.answer.slice(0, 5000) : null,
			}));
		if (!answers.length) return NextResponse.json({ error: 'Please answer at least one question.' }, { status: 400 });
		await AppointmentService.feedback({ path: { appointmentId }, body: { answers }, headers: auth.headers, throwOnError: true });
		return NextResponse.json({ ok: true }, { status: 201 });
	} catch (err) {
		return handleApiError(err);
	}
}
