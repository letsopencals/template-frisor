import { siteConfig } from '@/lib/site-config';

export function Lookbook() {
	const { lookbook } = siteConfig;

	return (
		<section className="relative bg-[var(--color-bg-deep)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1500px] px-6 lg:px-10">
				<div className="grid gap-6 border-b border-[var(--color-line)] pb-8 lg:grid-cols-12">
					<div className="lg:col-span-6">
						<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
							{lookbook.eyebrow}
						</p>
						<h2 className="heading-display mt-4 text-4xl text-[var(--color-cream)] lg:text-6xl">
							{lookbook.heading}
						</h2>
					</div>
					<div className="lg:col-span-5 lg:col-start-8 lg:flex lg:items-end">
						<p className="text-sm leading-relaxed text-[var(--color-cream-muted)]">{lookbook.body}</p>
					</div>
				</div>

				{/* Asymmetric grid: 12-col, two row tracks, frame 5 spans wider */}
				<div className="mt-12 grid gap-6 lg:auto-rows-[280px] lg:grid-cols-12">
					{lookbook.frames.map((frame, i) => {
						const colSpan = i === 5 ? 'lg:col-span-8' : 'lg:col-span-4';
						const rowSpan = frame.size === 'tall' ? 'lg:row-span-2' : 'lg:row-span-1';
						return (
							<figure
								key={i}
								className={`group relative flex flex-col ${colSpan} ${rowSpan}`}
							>
								<div
									className="image-placeholder relative h-72 w-full overflow-hidden lg:h-full lg:flex-1"
									style={{
										backgroundImage: `url('/images/${frame.image}')`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
								>
									<div className="absolute inset-0 bg-[var(--color-bg-deep)]/0 transition-colors group-hover:bg-[var(--color-bg-deep)]/30" />
								</div>
								<figcaption className="mt-3 flex items-center justify-between text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--color-cream-dim)]">
									<span>{frame.caption}</span>
									<span className="text-[var(--color-copper)]">{String(i + 1).padStart(2, '0')}</span>
								</figcaption>
							</figure>
						);
					})}
				</div>
			</div>
		</section>
	);
}
