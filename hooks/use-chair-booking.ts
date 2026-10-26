'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';
import { questionTitle, useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { invalidateStudioAvailability, useStudioAvailability } from '@/hooks/use-studio-availability';
import { isShelfSlug, type Barber, type Service, type Shop } from '@/lib/catalog';
import { localDate, slotOf, startsByDay, startsOf } from '@/lib/slots';
import { siteConfig } from '@/lib/site-config';

/**
 * The /book orchestrator, in the order the page asks: shop, service, barber, day and time, then
 * extras and the shelf, notes for the barber, and the hold in the cart. Availability is one cached
 * request per (service, shop) across the whole horizon; days and times are derived here.
 * Choices are derived where possible so changing one never needs an effect to repair another.
 */
export interface ChairInitial {
	service?: string | null;
	shop?: string | null;
	barber?: string | null;
	/** Comma-separated shelf slugs to put in the kit. */
	kit?: string | null;
}

const LAST_SHOP_KEY = 'frisor:last-shop';

function rememberedShop(): string | null {
	try {
		return typeof window !== 'undefined' ? window.localStorage.getItem(LAST_SHOP_KEY) : null;
	} catch {
		return null;
	}
}

export function useChairBooking({ services, barbers, shops, initial }: { services: Service[]; barbers: Barber[]; shops: Shop[]; initial: ChairInitial }) {
	const router = useRouter();
	const { cartId, setCart } = useCart();
	const timeZone = siteConfig.timeZone;
	const initialBarber = barbers.find((b) => b.slug === initial.barber) ?? null;
	const deepService = services.find((s) => s.slug === initial.service) ?? null;

	// ---------------------------------------------------------------- Shop (chosen first)
	const [shopChoice, setShopChoice] = useState<string | null>(
		() => initial.shop ?? (initialBarber ? (shops.find((s) => s.id === initialBarber.shops[0]?.id)?.slug ?? null) : null) ?? (deepService ? (shops.find((s) => deepService.shops.some((x) => x.id === s.id))?.slug ?? null) : null),
	);
	// The last shop used, read after hydration so server and client render the same first.
	useEffect(() => {
		if (shopChoice) return;
		const last = rememberedShop();
		if (last && shops.some((s) => s.slug === last)) setShopChoice(last);
	}, [shopChoice, shops]);
	const shop = shops.find((s) => s.slug === shopChoice) ?? shops[0] ?? null;

	/** Services offered at the chosen shop. */
	const menu = useMemo(() => services.filter((s) => !shop || s.shops.some((x) => x.id === shop.id)), [services, shop]);

	// ---------------------------------------------------------------- Service (a real choice unless deep-linked)
	const [serviceSlug, setServiceSlug] = useState<string | null>(() => deepService?.slug ?? null);
	const service = menu.find((s) => s.slug === serviceSlug) ?? null;
	const staffHere = useMemo(() => service?.shops.find((x) => x.id === shop?.id)?.staffIds ?? [], [service, shop]);
	const { byLocation, loading } = useStudioAvailability(service?.id, shop ? [shop.id] : []);

	// ---------------------------------------------------------------- Barber ("any available" by default)
	const [staffChoice, setStaffChoice] = useState<string | 'any'>(() => initialBarber?.id ?? 'any');
	const candidates = useMemo(() => barbers.filter((b) => staffHere.includes(b.id)), [barbers, staffHere]);
	const namedStaff = staffChoice !== 'any' && staffHere.includes(staffChoice) ? staffChoice : null;
	const barber = namedStaff ? (barbers.find((b) => b.id === namedStaff) ?? null) : null;

	// ---------------------------------------------------------------- Day & time
	const availability = shop ? byLocation[shop.id] : null;
	const starts = useMemo(() => startsOf(availability, namedStaff), [availability, namedStaff]);
	const days = useMemo(() => startsByDay(starts, timeZone), [starts, timeZone]);
	const [dayChoice, setDayChoice] = useState<string | null>(null);
	const day = dayChoice && days.has(dayChoice) ? dayChoice : (days.keys().next().value ?? null);
	const [startAt, setStartAt] = useState<number | null>(null);
	const selected = startAt != null ? (starts.find((s) => s.at === startAt) ?? null) : null;
	const finalStaffId = namedStaff ?? selected?.staffIds[0] ?? null;
	const finalBarber = finalStaffId ? (barbers.find((b) => b.id === finalStaffId) ?? null) : null;
	/** Next free start per barber here, for the portraits row. */
	const nextByBarber = useMemo(() => {
		const out: Record<string, number> = {};
		for (const s of startsOf(availability, null)) for (const id of s.staffIds) if (out[id] === undefined) out[id] = s.at;
		return out;
	}, [availability]);

	// ---------------------------------------------------------------- Kit
	const addOns = useBookingAddOns({ variantSlug: service?.slug ?? null, locationId: shop?.id ?? null, staffMemberId: finalStaffId, bookedDurationUnits: 1 });
	const [kitApplied, setKitApplied] = useState(false);
	useEffect(() => {
		if (kitApplied || !initial.kit || addOns.availableAddOns.length === 0) return;
		for (const slug of initial.kit.split(',')) {
			const a = addOns.availableAddOns.find((x) => x.slug === slug.trim());
			if (a) addOns.updateQuantity(a.id, 1);
		}
		setKitApplied(true);
	}, [kitApplied, initial.kit, addOns]);
	const shelfOffered = useMemo(() => addOns.availableAddOns.filter((a) => isShelfSlug(a.slug)), [addOns.availableAddOns]);
	const extrasOffered = useMemo(() => addOns.availableAddOns.filter((a) => !isShelfSlug(a.slug)), [addOns.availableAddOns]);
	const shelfTotal = shelfOffered.reduce((n, a) => n + a.price * (addOns.selectedAddOns.get(a.id) ?? 0), 0);

	// ---------------------------------------------------------------- Notes
	const questions = useCheckoutQuestions(service?.slug ?? null);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const missingNotes = questions.filter((q) => q.required && !(answers[q.id] ?? '').trim());

	// ---------------------------------------------------------------- Handlers
	const chooseService = useCallback((slug: string) => {
		setServiceSlug(slug);
		setStartAt(null);
		setDayChoice(null);
	}, []);
	const chooseShop = useCallback((slug: string) => {
		setShopChoice(slug);
		setStartAt(null);
		setDayChoice(null);
		try {
			window.localStorage.setItem(LAST_SHOP_KEY, slug);
		} catch {
			/* private mode */
		}
	}, []);
	const chooseBarber = useCallback((id: string | 'any') => {
		setStaffChoice(id);
		setStartAt(null);
	}, []);
	const chooseDay = useCallback((d: string) => {
		setDayChoice(d);
		setStartAt(null);
	}, []);
	const chooseStart = useCallback((at: number) => {
		setStartAt(at);
		setLostSlot(false);
		setError(null);
		setDayChoice(localDate(at, timeZone));
	}, [timeZone]);

	// ---------------------------------------------------------------- Hold
	const [holding, setHolding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	/** The held time was taken by someone else: the page sends the visitor back to the times. */
	const [lostSlot, setLostSlot] = useState(false);
	const missing: string[] = [];
	if (!service) missing.push('a service');
	else if (!shop) missing.push('a shop');
	else if (!selected) missing.push('a time');
	if (missingNotes.length) missing.push('the notes your barber needs');

	/** Hold the chair (with the kit) and open checkout. `skipShelf` leaves shelf products out. */
	const hold = useCallback(async (opts: { skipShelf?: boolean } = {}) => {
		if (!service || !shop || !selected || !finalStaffId || missing.length || holding) return;
		setHolding(true);
		setError(null);
		const chosen = [...addOns.selectedAddOns.entries()].filter(([id, q]) => q > 0 && !(opts.skipShelf && isShelfSlug(addOns.availableAddOns.find((a) => a.id === id)?.slug)));
		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (cartId) headers['X-Cart-Id'] = cartId;
			const res = await fetch('/api/book', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					slot: { productId: service.id, ...slotOf(selected.at, service.duration), staffMemberId: finalStaffId, locationId: shop.id },
					numberOfAttendees: 1,
					addOns: chosen.map(([addOnId, quantity]) => {
						const a = addOns.availableAddOns.find((x) => x.id === addOnId);
						return a?.durationMultiplied ? { addOnId } : { addOnId, quantity };
					}),
					checkoutQuestionAnswers: questions
						.filter((q) => (answers[q.id] ?? '').trim())
						.map((q) => ({ questionId: q.id, question: questionTitle(q), answer: answers[q.id]!.trim() })),
				}),
			});
			const data = (await res.json().catch(() => null)) as { cart?: Parameters<typeof setCart>[0]; error?: string; code?: string } | null;
			if (data?.cart) setCart(data.cart);
			if (!res.ok) {
				if (data?.code === 'slot_unavailable') {
					invalidateStudioAvailability();
					setStartAt(null);
					setLostSlot(true);
				}
				setError(data?.error || 'We couldn’t hold that chair. Please try again.');
				return;
			}
			const hasShelf = chosen.map(([id]) => id).some((id) => isShelfSlug(addOns.availableAddOns.find((a) => a.id === id)?.slug));
			const code = siteConfig.shelf.autoCode;
			if (hasShelf && code && data?.cart && !(data.cart as { appliedDiscountCode?: string | null }).appliedDiscountCode) {
				const r = await fetch('/api/cart/discount-code', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Cart-Id': (data.cart as { id: string }).id }, body: JSON.stringify({ code }) });
				if (r.ok) setCart(await r.json());
			}
			router.push('/checkout');
		} catch {
			setError('We couldn’t reach the shop just now. Please try again.');
		} finally {
			setHolding(false);
		}
	}, [service, shop, selected, finalStaffId, missing.length, holding, cartId, addOns, questions, answers, setCart, router]);

	return {
		shops,
		shop,
		chooseShop,
		menu,
		service,
		chooseService,
		loading,
		nextByBarber,
		candidates,
		staffChoice: namedStaff ?? 'any',
		barber,
		chooseBarber,
		starts,
		days,
		day,
		chooseDay,
		dayStarts: day ? (days.get(day) ?? []) : [],
		selected,
		chooseStart,
		finalBarber,
		timeZone,
		addOns,
		shelfOffered,
		extrasOffered,
		shelfTotal,
		questions,
		answers,
		setAnswer: (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v })),
		total: (service?.price ?? 0) + addOns.addOnsTotal,
		missing,
		hold,
		holding,
		error,
		lostSlot,
	};
}

export type ChairBooking = ReturnType<typeof useChairBooking>;
