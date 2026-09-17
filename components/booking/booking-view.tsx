'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';
import { BOOKING_STEPS, type BookingStep } from '@/lib/booking-constants';
import { HorizontalDayStrip } from '@/components/booking/horizontal-day-strip';
import { TimeSlots } from '@/components/booking/time-slots';
import { StaffSelector } from '@/components/booking/staff-selector';
import { LocationSelector } from '@/components/booking/location-selector';
import { AddOnsSelector } from '@/components/booking/addons-selector';
import { BookingSummary } from '@/components/booking/booking-summary';
import { DetailsStep } from '@/components/booking/details-step';
import { StepIndicator } from '@/components/booking/step-indicator';
import { QuestionsForm } from '@/components/booking/questions-form';
import { Button } from '@/components/ui/button';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import { useSettings } from '@/contexts/settings-context';

// PaymentStep pulls in Stripe (@stripe/react-stripe-js + stripe-js), which is
// heavy and only needed on the final step — load it on demand.
const PaymentStep = dynamic(
	() => import('@/components/booking/payment-step').then((m) => m.PaymentStep),
	{ ssr: false },
);

const STEP_INITIAL = { opacity: 0, y: 12 };
const STEP_ANIMATE = { opacity: 1, y: 0 };
const STEP_EXIT = { opacity: 0, y: -8 };
const STEP_TRANSITION = { duration: 0.25 };

export function BookingView({
	slug,
	initialProduct,
}: {
	slug: string;
	initialProduct: ProductListItemResponse | null;
}) {
	const { currency } = useSettings();
	const flow = useBookingFlow(slug, initialProduct);

	if (flow.loading) {
		return (
			<div className="min-h-screen bg-[var(--color-bg)] pt-32 pb-20">
				<div className="mx-auto max-w-[1100px] px-6 lg:px-10">
					<div className="animate-pulse space-y-6">
						<div className="h-12 rounded-lg bg-[var(--color-surface)]" />
						<div className="h-32 rounded-2xl bg-[var(--color-surface)]" />
						<div className="h-64 rounded-2xl bg-[var(--color-surface)]" />
					</div>
				</div>
			</div>
		);
	}

	if (flow.error && !flow.product) {
		return (
			<div className="min-h-screen bg-[var(--color-bg)] pt-32 pb-20">
				<div className="mx-auto max-w-[1100px] px-6 text-center lg:px-10">
					<p className="text-[var(--color-cream-muted)]">{flow.error}</p>
					<Link
						href="/services"
						className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-copper)] hover:underline"
					>
						&larr; Back to Services
					</Link>
				</div>
			</div>
		);
	}

	if (!flow.product) return null;

	const variantLocations = flow.activeVariant?.locations ?? [];
	const variantLabel = flow.hasVariants ? (flow.activeVariant?.variantTitle ?? null) : null;
	const totalPrice =
		(flow.activeVariant?.price ?? flow.product.price) * flow.attendees + flow.addOnsTotal;
	const displayPrice = formatPrice(totalPrice, currency);

	const visibleSteps: BookingStep[] = BOOKING_STEPS.filter((s) => {
		if (s === 'who' && flow.whoSkipped) return false;
		if (s === 'questions' && flow.questionsSkipped) return false;
		return true;
	});

	const showSummary =
		flow.step === 'extras' || flow.step === 'questions' || flow.step === 'details' || flow.step === 'payment';

	const finalStaff = flow.staffForLocation.find((s) => s.id === flow.finalStaffId) ?? null;
	const selectedLocation = variantLocations.find((l) => l.id === flow.selectedLocationId) ?? null;

	return (
		<div className="min-h-screen bg-[var(--color-bg)]">
			{/* Editorial top bar */}
			<div className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-bg)]/95 pt-20 backdrop-blur-md">
				<div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-5 lg:px-10">
					<Link
						href="/services"
						className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)]/75 transition-colors hover:text-[var(--color-copper)]"
					>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
						All services
					</Link>
					<div className="text-center">
						<p className="text-[0.55rem] font-medium uppercase tracking-[0.32em] text-[var(--color-cream-dim)]">
							Booking
						</p>
						<p className="heading-display text-base text-[var(--color-cream)] sm:text-lg">{flow.product.title}</p>
					</div>
					<span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.22em] text-[var(--color-cream-dim)] sm:block">
						{displayPrice}
					</span>
					<span className="sm:hidden w-6" />
				</div>
			</div>

			<div className="mx-auto max-w-[1200px] px-6 pt-10 pb-24 lg:px-10">
				<div className={`grid gap-10 ${showSummary ? 'lg:grid-cols-[1fr_360px]' : ''}`}>
					<div className={`min-w-0 ${showSummary ? 'order-2 lg:order-1' : ''}`}>
						{/* Location strip */}
						{variantLocations.length > 1 ? (
							<div className="mb-6">
								<p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream-dim)]">
									Shop
								</p>
								<LocationSelector
									locations={variantLocations}
									selected={flow.selectedLocationId}
									onSelect={flow.setSelectedLocationId}
								/>
							</div>
						) : null}

						{/* Variant pills */}
						{flow.hasVariants && flow.variants.length > 1 ? (
							<div className="mb-6">
								<p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream-dim)]">
									Variant
								</p>
								<div className="no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2">
									{flow.variants.map((v) => {
										const isActive = (flow.activeVariant?.id ?? flow.variants[0]?.id) === v.id;
										return (
											<button
												key={v.id}
												onClick={() => flow.setSelectedVariantId(v.id)}
												className={`shrink-0 rounded-full border px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] transition-all ${
													isActive
														? 'border-[var(--color-copper)] bg-[var(--color-copper)] text-[var(--color-bg-deep)]'
														: 'border-[var(--color-line-strong)] text-[var(--color-cream)] hover:border-[var(--color-copper)]/40'
												}`}
											>
												{v.variantTitle} · {formatPrice(v.price, currency)}
											</button>
										);
									})}
								</div>
							</div>
						) : null}

						{/* Step indicator */}
						<StepIndicator
							steps={visibleSteps}
							current={flow.step}
							completed={flow.stepCompleted}
							canEnter={flow.canEnter}
							onSelect={flow.goToStep}
						/>

						{/* Error banner */}
						{flow.error ? (
							<div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
								{flow.error}
								<button onClick={() => flow.setError(null)} className="ml-2 font-medium underline">
									Dismiss
								</button>
							</div>
						) : null}

						<div className="mt-8">
							<AnimatePresence mode="wait">
								{flow.step === 'when' ? (
									<motion.div key="when" initial={STEP_INITIAL} animate={STEP_ANIMATE} exit={STEP_EXIT} transition={STEP_TRANSITION}>
										{flow.staffForLocation.length > 1 ? (
											<div className="mb-6">
												<StaffSelector
													staffMembers={flow.staffForLocation}
													selected={flow.selectedStaffId}
													onSelect={flow.setSelectedStaffId}
												/>
											</div>
										) : null}

										<HorizontalDayStrip selectedDate={flow.selectedDate} onDateSelect={flow.setSelectedDate} />

										<div className="mt-6">
											{flow.selectedDate ? (
												<TimeSlots
													slots={flow.slots}
													selectedSlot={flow.selectedSlot}
													onSlotSelect={flow.handleSlotSelect}
													loading={flow.slotsLoading}
													timezone={flow.timezone}
													staffMembers={flow.staffForLocation}
												/>
											) : (
												<p className="rounded-2xl border border-dashed border-[var(--color-line)] py-10 text-center text-sm text-[var(--color-cream-muted)]">
													Pick a day above to see open times.
												</p>
											)}
										</div>
									</motion.div>
								) : null}

								{flow.step === 'who' && flow.selectedSlot ? (
									<motion.div key="who" initial={STEP_INITIAL} animate={STEP_ANIMATE} exit={STEP_EXIT} transition={STEP_TRANSITION}>
										<p className="mb-5 text-sm text-[var(--color-cream-muted)]">
											Choose a barber for your appointment.
										</p>
										<StaffSelector
											staffMembers={flow.slotStaff}
											selected={flow.confirmedStaffId}
											onSelect={flow.setConfirmedStaffId}
											hideLabel
										/>
									</motion.div>
								) : null}

								{flow.step === 'extras' && flow.selectedSlot ? (
									<motion.div key="extras" initial={STEP_INITIAL} animate={STEP_ANIMATE} exit={STEP_EXIT} transition={STEP_TRANSITION} className="space-y-6">
										<AddOnsSelector
											addOns={flow.availableAddOns}
											loading={flow.addOnsLoading}
											selected={flow.selectedAddOns}
											bookedDurationUnits={flow.bookedDurationUnits}
											currency={currency}
											onChange={flow.updateAddOnQuantity}
										/>

										<Button
											onClick={flow.handleContinueFromExtras}
											variant="accent"
											size="lg"
											fullWidth
											className="gap-3"
										>
											{flow.selectedAddOns.size > 0 ? 'Continue' : 'Skip & Continue'}
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
											</svg>
										</Button>
									</motion.div>
								) : null}

								{flow.step === 'questions' ? (
									<motion.div key="questions" initial={STEP_INITIAL} animate={STEP_ANIMATE} exit={STEP_EXIT} transition={STEP_TRANSITION}>
										<QuestionsForm
											questions={flow.questions}
											answers={flow.answers}
											setAnswers={flow.setAnswers}
											valid={flow.questionsValid}
											onContinue={flow.handleContinueFromQuestions}
										/>
									</motion.div>
								) : null}

								{flow.step === 'details' ? (
									<motion.div key="details" initial={STEP_INITIAL} animate={STEP_ANIMATE} exit={STEP_EXIT} transition={STEP_TRANSITION}>
										<DetailsStep
											email={flow.email}
											firstName={flow.firstName}
											lastName={flow.lastName}
											customerId={flow.customerId}
											onChangeEmail={flow.setEmail}
											onChangeFirstName={flow.setFirstName}
											onChangeLastName={flow.setLastName}
											fieldErrors={flow.fieldErrors}
											submitting={flow.submitting}
											canSubmit={flow.detailsValid}
											onSubmit={flow.handleSubmitDetails}
										/>
									</motion.div>
								) : null}

								{flow.step === 'payment' ? (
									<motion.div key="payment" initial={STEP_INITIAL} animate={STEP_ANIMATE} exit={STEP_EXIT} transition={STEP_TRANSITION}>
										<PaymentStep
											providers={flow.providers}
											provider={flow.provider}
											paymentData={flow.paymentData}
											submitting={flow.submitting}
											isExpired={flow.isExpired}
											onSelectProvider={flow.handleSelectProvider}
											onStripeSuccess={(piId) => flow.handleSubmitCheckout(piId)}
											onStripeError={(msg) => flow.setError(msg)}
											onSubmitCash={() => flow.handleSubmitCheckout()}
										/>
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>
					</div>

					{/* Sticky summary panel — only visible from details step onward */}
					{showSummary ? (
						<aside className="order-1 lg:order-2">
							<div className="lg:sticky lg:top-32">
								{flow.selectedSlot ? (
									<BookingSummary
										product={flow.product}
										activeVariant={flow.activeVariant}
										variantLabel={variantLabel}
										staff={finalStaff}
										location={selectedLocation}
										selectedSlot={flow.selectedSlot}
										selectedDate={flow.selectedDate}
										availableAddOns={flow.availableAddOns}
										selectedAddOns={flow.selectedAddOns}
										bookedDurationUnits={flow.bookedDurationUnits}
										currency={currency}
										attendees={flow.attendees}
										formatCustom={flow.formatCustom}
										formatTimeRange={flow.formatTimeRange}
									/>
								) : (
									<div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-8 text-center">
										<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
											Booking Summary
										</p>
										<p className="mt-3 text-xs text-[var(--color-cream-dim)]">
											Your selections will appear here as you fill in the steps.
										</p>
									</div>
								)}

								<div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-copper)]/40 bg-[var(--color-surface-2)]/30 px-5 py-4">
									<div className="flex items-baseline justify-between">
										<span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream-dim)]">
											Total
										</span>
										<span className="heading-display text-2xl text-[var(--color-copper)]">{displayPrice}</span>
									</div>
								</div>
							</div>
						</aside>
					) : null}
				</div>
			</div>
		</div>
	);
}
