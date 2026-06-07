import { siteConfig } from '@/lib/site-config';

export function StoryStrip() {
	const { storyStrip } = siteConfig;

	return (
		<section className="relative border-y border-[var(--color-line)] bg-[var(--color-bg-deep)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1500px] px-6 lg:px-10">
				<div className="flex items-end justify-between border-b border-[var(--color-line)] pb-6">
					<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
						{storyStrip.eyebrow}
					</p>
					<p className="hidden text-[0.6rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream-dim)] sm:block">
						Scroll →
					</p>
				</div>

				<div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory overflow-x-auto px-6 lg:mx-0 lg:px-0">
					{storyStrip.cards.map((card, i) => (
						<article
							key={i}
							className="relative mr-5 flex w-[78%] shrink-0 snap-start flex-col justify-between rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-8 last:mr-0 sm:w-[48%] lg:mr-6 lg:w-[24%] lg:p-10"
						>
							{/* Top copper rule */}
							<div className="absolute top-0 left-8 right-8 h-[2px] bg-[var(--color-copper)]" />
							<div className="heading-display text-7xl text-[var(--color-copper)] lg:text-8xl">
								{card.numeral}
							</div>
							<div className="mt-12">
								<h3 className="heading-display text-2xl text-[var(--color-cream)] lg:text-3xl">
									{card.heading}
								</h3>
								<p className="mt-4 text-sm leading-relaxed text-[var(--color-cream-muted)]">
									{card.body}
								</p>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
