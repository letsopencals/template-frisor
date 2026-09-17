'use client';

import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

interface QuestionsFormProps {
	questions: CheckoutQuestionResponse[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	valid: boolean;
	onContinue: () => void;
}

export function QuestionsForm({ questions, answers, setAnswers, valid, onContinue }: QuestionsFormProps) {
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
									{q.required ? <span className="ml-1 text-[var(--color-copper)]">*</span> : null}
								</label>
								{description ? (
									<p className="mb-2 text-xs text-[var(--color-cream-dim)]">{description}</p>
								) : null}
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
									<Textarea
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										rows={3}
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
									<Input
										type="text"
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<Button
				onClick={onContinue}
				disabled={!valid}
				variant="accent"
				size="lg"
				fullWidth
				className="gap-3"
			>
				Continue
				<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
				</svg>
			</Button>
		</div>
	);
}
