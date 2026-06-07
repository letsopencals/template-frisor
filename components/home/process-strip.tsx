import { siteConfig } from '@/lib/site-config';

export function ProcessStrip() {
	const { process } = siteConfig;

	return (
		<section className="relative bg-[var(--color-bg)] py-20 lg:py-24">
			<div className="mx-auto max-w-[1500px] px-6 lg:px-10">
				<div className="border-b border-[var(--color-line)] pb-8">
					<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
						{process.eyebrow}
					</p>
				</div>

				<div className="mt-12 grid overflow-visible rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] sm:grid-cols-2 lg:grid-cols-4">
					{process.steps.map((step, i) => (
						<div
							key={step.number}
							className={`relative p-8 lg:p-10 ${
								i < process.steps.length - 1
									? 'border-b border-[var(--color-line)] sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r'
									: ''
							} ${i === process.steps.length - 2 ? 'sm:border-b-0' : ''}`}
						>
							<div className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream-dim)]">
								<span className="heading-display text-3xl text-[var(--color-copper)] lg:text-4xl">{step.number}</span>
							</div>
							<h3 className="heading-display mt-6 text-xl text-[var(--color-cream)] lg:text-2xl">
								{step.title}
							</h3>
							<p className="mt-3 text-sm leading-relaxed text-[var(--color-cream-muted)]">
								{step.body}
							</p>
							{i < process.steps.length - 1 && (
								<div className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 translate-x-1/2 lg:block">
									<div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-bg)]">
										<svg className="h-3 w-3 text-[var(--color-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
