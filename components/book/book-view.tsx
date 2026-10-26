'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Barber, Service, ShelfItem, Shop } from '@/lib/catalog';
import { useChairBooking, type ChairInitial } from '@/hooks/use-chair-booking';
import { StepHeader } from '@/components/book/step-header';
import { StepShopService, type MenuSectionRef } from '@/components/book/step-shop-service';
import { StepBarberTime } from '@/components/book/step-barber-time';
import { StepShelf } from '@/components/book/step-shelf';
import { ChairSummary, type BookStep, type PrimaryAction } from '@/components/book/chair-summary';
import { MobileBar } from '@/components/book/mobile-bar';

const TITLES: Record<BookStep, { title: string; line: string }> = {
	1: { title: 'Choose a shop and a service', line: 'Three shops, one menu. Prices include VAT.' },
	2: { title: 'Choose your barber and a time', line: 'Any barber gets you the most times. Times are in Berlin time.' },
	3: { title: 'Anything from the shelf?', line: 'Packed and waiting at your station when you sit down. Or skip it.' },
};

/**
 * /book (DESIGN.md "The booking flow"): three screen-sized steps on the left, "Your chair" on the
 * right (sticky) or in a bar at the bottom on phones, so the total and the next action are always
 * in view. Choosing a service moves on to step 2 by itself.
 */
export function BookView({ services, barbers, shops, shelf, sections, currency, initial }: { services: Service[]; barbers: Barber[]; shops: Shop[]; shelf: ShelfItem[]; sections: MenuSectionRef[]; currency: string; initial: ChairInitial }) {
	const b = useChairBooking({ services, barbers, shops, initial });
	const [step, setStep] = useState<BookStep>(b.service ? 2 : 1);
	const reached: BookStep = b.selected ? 3 : b.service ? 2 : 1;
	const top = useRef<HTMLDivElement>(null);
	const heading = useRef<HTMLHeadingElement>(null);
	const first = useRef(true);

	// On every step change: bring the step's top under the header and move focus to its heading.
	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		const el = top.current;
		if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		heading.current?.focus({ preventScroll: true });
	}, [step]);

	// The held time was taken: back to the times.
	useEffect(() => {
		if (b.lostSlot) setStep(2);
	}, [b.lostSlot]);

	const go = useCallback((s: BookStep) => setStep(s), []);
	const chooseService = useCallback(
		(slug: string) => {
			b.chooseService(slug);
			setStep(2);
		},
		[b],
	);

	const primary: PrimaryAction =
		step === 1
			? { label: b.service ? 'Continue to times' : 'Choose a service', short: b.service ? 'Continue' : 'Choose a service', disabled: !b.service, onClick: () => setStep(2) }
			: step === 2
				? { label: b.selected ? 'Continue' : 'Pick a time', short: b.selected ? 'Continue' : 'Pick a time', disabled: !b.selected, onClick: () => setStep(3) }
				: { label: 'Continue to details', short: 'Continue', disabled: b.missing.length > 0, busy: b.holding, onClick: () => void b.hold() };

	const t = TITLES[step];

	return (
		<div className="mx-auto max-w-[1440px] px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pb-20">
			<div ref={top} className="scroll-mt-[calc(var(--header-h)+8px)]">
				<StepHeader step={step} reached={reached} onGo={go} />
			</div>
			<div className="mt-2 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-14">
				<section aria-labelledby="book-step-title" className="min-w-0">
					<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-paper-3 pb-5">
						<div>
							<h1 id="book-step-title" ref={heading} tabIndex={-1} className="display text-[2rem] leading-tight outline-none sm:text-[2.6rem]">
								{t.title}
							</h1>
							<p className="mt-1 text-sm text-ink-2">{t.line}</p>
						</div>
						{step > 1 ? (
							<button type="button" onClick={() => setStep((step - 1) as BookStep)} className="link min-h-[44px] text-sm text-ink-2">
								← Back
							</button>
						) : null}
					</div>
					<div key={step} className="fade-in pt-6">
						{step === 1 ? <StepShopService shops={shops} shop={b.shop} onShop={b.chooseShop} menu={b.menu} sections={sections} selected={b.service} onChoose={chooseService} currency={currency} /> : null}
						{step === 2 ? <StepBarberTime b={b} /> : null}
						{step === 3 ? <StepShelf b={b} shelf={shelf} currency={currency} onSkip={() => void b.hold({ skipShelf: true })} /> : null}
					</div>
				</section>

				<aside aria-label="Your chair" className="hidden lg:block">
					<div className="sticky top-[calc(var(--header-h)+20px)]">
						<ChairSummary b={b} currency={currency} primary={primary} onEdit={go} />
					</div>
				</aside>
			</div>
			<MobileBar b={b} currency={currency} primary={primary} onEdit={go} />
		</div>
	);
}
