import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { isShelfSlug } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import type { Sitting, SittingCharge } from '@/lib/sittings';

/** Server-only: SDK appointment detail → public-safe `Sitting` (explicit allow-list). */

function chargeOf(detail: AppointmentDetailResponse): SittingCharge | null {
	const order = detail.order ?? detail.orderLineItem?.order ?? null;
	if (!order) return null;
	const providers = [
		...new Set(
			(order.transactions ?? [])
				.filter((t) => t.status === 'success' && t.type !== 'refund' && t.type !== 'void')
				.map((t) => t.provider),
		),
	];
	return {
		orderId: order.id,
		orderName: order.name,
		currency: order.paymentCurrencyCode,
		orderTotal: order.total,
		paidTotal: order.paidTotal,
		balance: order.balance,
		totalDiscount: (order as { totalDiscount?: number }).totalDiscount ?? 0,
		paymentStatus: order.paymentStatus,
		providers,
	};
}

export function toSitting(detail: AppointmentDetailResponse): Sitting {
	const p = detail.product;
	const s = detail.staffMember;
	const l = detail.location;
	const cityLine = l ? [l.postalCode, l.city].filter(Boolean).join(' ') : '';
	const display = detail.displayAddress ?? l?.displayAddress ?? null;
	return {
		id: detail.id,
		status: detail.status,
		from: detail.from,
		to: detail.to,
		service: {
			id: p.id,
			slug: p.slug,
			title: p.title,
			option: p.variantTitle && p.variantTitle !== 'Default Title' ? p.variantTitle : null,
			duration: p.duration,
			price: p.price,
			image: (p as { image?: { url?: string | null } | null }).image?.url ?? null,
			allowCustomerCancel: p.allowCustomerCancel !== false,
			allowCustomerReschedule: p.allowCustomerReschedule !== false,
			cancelGap: p.cancelGap ?? 0,
			rescheduleGap: p.rescheduleGap ?? 0,
		},
		barber: s
			? {
					id: s.id,
					slug: s.slug,
					name: [s.firstName, s.lastName].filter(Boolean).join(' '),
					firstName: s.firstName ?? '',
					imageUrl: s.image?.url ?? null,
				}
			: null,
		shop: l
			? {
					id: l.id,
					slug: l.slug,
					title: l.title ?? siteConfig.name,
					addressLines: display
						? display.split(/\n|,(?=\s*\S)/).map((x) => x.trim()).filter(Boolean).slice(0, 3)
						: [l.addressLine1, cityLine].filter((x): x is string => !!x),
					latitude: l.latitude ?? null,
					longitude: l.longitude ?? null,
				}
			: null,
		notes: (detail.checkoutQuestionAnswers ?? []).map((a) => ({ question: a.question, answer: a.answer ?? null })),
		lines: (detail.addOns ?? []).map((a) => {
			const addOn = a.addOn as { slug?: string; title?: string; price?: number; image?: { url?: string | null } | null } | undefined;
			return {
				id: a.id,
				slug: addOn?.slug ?? null,
				title: addOn?.title ?? 'Extra',
				quantity: a.quantity,
				unitPrice: addOn?.price ?? 0,
				image: addOn?.image?.url ?? null,
				shelf: isShelfSlug(addOn?.slug),
			};
		}),
		charge: chargeOf(detail),
	};
}
