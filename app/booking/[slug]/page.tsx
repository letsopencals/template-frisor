'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import { BOOKING_STEPS, STEP_LABELS, type BookingStep } from '@/lib/booking-constants';
import { HorizontalDayStrip } from '@/components/booking/horizontal-day-strip';
import { TimeSlots } from '@/components/booking/time-slots';
import { StaffSelector } from '@/components/booking/staff-selector';
import { LocationSelector } from '@/components/booking/location-selector';
import { AddOnsSelector } from '@/components/booking/addons-selector';
import { BookingSummary } from '@/components/booking/booking-summary';
import { DetailsStep } from '@/components/booking/details-step';
import { PaymentStep } from '@/components/booking/payment-step';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import { useSettings } from '@/contexts/settings-context';

export default function BookingPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { currency } = useSettings();
	const flow = useBookingFlow(slug);

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

	const showSummary = flow.step === 'extras' || flow.step === 'questions' || flow.step === 'details' || flow.step === 'payment';

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
						{variantLocations.length > 1 && (
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
						)}

						{/* Variant pills */}
						{flow.hasVariants && flow.variants.length > 1 && (
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
						)}

						{/* Step indicator */}
						<StepIndicator
							steps={visibleSteps}
							current={flow.step}
							completed={flow.stepCompleted}
							canEnter={flow.canEnter}
							onSelect={flow.goToStep}
						/>

						{/* Error banner */}
						{flow.error && (
							<div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
								{flow.error}
								<button onClick={() => flow.setError(null)} className="ml-2 font-medium underline">
									Dismiss
								</button>
							</div>
						)}

						<div className="mt-8">
							<AnimatePresence mode="wait">
								{flow.step === 'when' && (
									<motion.div
										key="when"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25 }}
									>
										{flow.staffForLocation.length > 1 && (
											<div className="mb-6">
												<StaffSelector
													staffMembers={flow.staffForLocation}
													selected={flow.selectedStaffId}
													onSelect={flow.setSelectedStaffId}
												/>
											</div>
										)}

										<HorizontalDayStrip
											selectedDate={flow.selectedDate}
											onDateSelect={flow.setSelectedDate}
										/>

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
								)}

								{flow.step === 'who' && flow.selectedSlot && (
									<motion.div
										key="who"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25 }}
									>
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
								)}

								{flow.step === 'extras' && flow.selectedSlot && (
									<motion.div
										key="extras"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25 }}
										className="space-y-6"
									>
										<AddOnsSelector
											addOns={flow.availableAddOns}
											loading={flow.addOnsLoading}
											selected={flow.selectedAddOns}
											bookedDurationUnits={flow.bookedDurationUnits}
											currency={currency}
											onChange={flow.updateAddOnQuantity}
										/>

										<button
											onClick={flow.handleContinueFromExtras}
											className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-copper)] px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg-deep)] transition-all hover:bg-[var(--color-copper-bright)]"
										>
											{flow.selectedAddOns.size > 0 ? 'Continue' : 'Skip & Continue'}
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
											</svg>
										</button>
									</motion.div>
								)}

								{flow.step === 'questions' && (
									<motion.div
										key="questions"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25 }}
									>
										<QuestionsForm
											questions={flow.questions}
											answers={flow.answers}
											setAnswers={flow.setAnswers}
											valid={flow.questionsValid}
											onContinue={flow.handleContinueFromQuestions}
										/>
									</motion.div>
								)}

								{flow.step === 'details' && (
									<motion.div
										key="details"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25 }}
									>
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
								)}

								{flow.step === 'payment' && (
									<motion.div
										key="payment"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25 }}
									>
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
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Sticky summary panel — only visible from details step onward */}
					{showSummary && <aside className="order-1 lg:order-2">
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
					</aside>}
				</div>
			</div>
		</div>
	);
}

function StepIndicator({
	steps,
	current,
	completed,
	canEnter,
	onSelect,
}: {
	steps: BookingStep[];
	current: BookingStep;
	completed: Record<BookingStep, boolean>;
	canEnter: (s: BookingStep) => boolean;
	onSelect: (s: BookingStep) => void;
}) {
	return (
		<ol className="no-scrollbar -mx-2 flex items-center gap-2 overflow-x-auto border-b border-[var(--color-line)] px-2 pb-4">
			{steps.map((s, i) => {
				const isActive = s === current;
				const isDone = completed[s] && !isActive;
				const enabled = canEnter(s);
				const index = String(i + 1).padStart(2, '0');
				return (
					<li key={s} className="flex shrink-0 items-center gap-2">
						<button
							type="button"
							disabled={!enabled}
							onClick={() => onSelect(s)}
							className={`group flex items-baseline gap-2 rounded-full border px-4 py-2 transition-all ${
								isActive
									? 'border-[var(--color-copper)] bg-[var(--color-copper)]/10'
									: enabled
										? 'border-[var(--color-line-strong)] hover:border-[var(--color-copper)]/60'
										: 'border-[var(--color-line)] opacity-50'
							}`}
						>
							<span
								className={`text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${
									isActive
										? 'text-[var(--color-copper)]'
										: isDone
											? 'text-[var(--color-cream)]/75'
											: 'text-[var(--color-cream-dim)]'
								}`}
							>
								{index}
							</span>
							<span
								className={`heading-display text-base ${
									isActive
										? 'text-[var(--color-cream)]'
										: isDone
											? 'text-[var(--color-cream)]/85'
											: 'text-[var(--color-cream)]/55'
								}`}
							>
								{STEP_LABELS[s]}
							</span>
							{isDone && (
								<svg
									className="h-3.5 w-3.5 text-[var(--color-copper)]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							)}
						</button>
						{i < steps.length - 1 && (
							<span className="text-[0.65rem] text-[var(--color-cream-dim)]">→</span>
						)}
					</li>
				);
			})}
		</ol>
	);
}

function QuestionsForm({
	questions,
	answers,
	setAnswers,
	valid,
	onContinue,
}: {
	questions: import('@opencals/storefront-sdk').CheckoutQuestionResponse[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	valid: boolean;
	onContinue: () => void;
}) {
	const ordered = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

	return (
		<div className="space-y-6">
			<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
				<div className="border-b border-[var(--color-line)] bg-[var(--color-bg-deep)] px-5 py-4">
					<p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-copper)]">
						Questions
					</p>
					<p className="mt-1 text-[0.7rem] text-[var(--color-cream-dim)]">
						A few things before your visit.
					</p>
				</div>
				<div className="space-y-5 px-5 py-5">
					{ordered.map((q) => {
						const translation = q.translations?.[0];
						const title = translation?.title ?? q.internalName;
						const description = translation?.description;
						const options = translation?.options;
						const value = answers[q.id] ?? '';
						return (
							<div key={q.id}>
								<label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]">
									{title}
									{q.required && <span className="ml-1 text-[var(--color-copper)]">*</span>}
								</label>
								{description && (
									<p className="mb-2 text-xs text-[var(--color-cream-dim)]">{description}</p>
								)}
								{q.type === 'dropdown' && options ? (
									<select
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors focus:border-[var(--color-copper)]"
									>
										<option value="">Select…</option>
										{options.map((o) => (
											<option key={o} value={o}>{o}</option>
										))}
									</select>
								) : q.type === 'multi-line-text-field' ? (
									<textarea
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										rows={3}
										className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors focus:border-[var(--color-copper)]"
									/>
								) : q.type === 'checkbox' ? (
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={value === 'true'}
											onChange={(e) =>
												setAnswers((prev) => ({ ...prev, [q.id]: e.target.checked ? 'true' : 'false' }))
											}
											className="h-4 w-4 accent-[var(--color-copper)]"
										/>
										<span className="text-sm text-[var(--color-cream)]">Yes</span>
									</label>
								) : (
									<input
										type="text"
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors focus:border-[var(--color-copper)]"
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<button
				onClick={onContinue}
				disabled={!valid}
				className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-copper)] px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg-deep)] transition-all hover:bg-[var(--color-copper-bright)] disabled:cursor-not-allowed disabled:opacity-40"
			>
				Continue
				<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
				</svg>
			</button>
		</div>
	);
}
