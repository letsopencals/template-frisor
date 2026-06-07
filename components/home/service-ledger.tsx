'use client';

import { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function ServiceLedger() {
	const { services } = siteConfig;
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<section className="relative bg-[var(--color-bg)] py-20 lg:py-32" id="services">
			<div className="mx-auto max-w-[1500px] px-6 lg:px-10">
				{/* Section header */}
				<div className="grid gap-6 border-b border-[var(--color-line)] pb-8 lg:grid-cols-12">
					<div className="lg:col-span-6">
						<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
							The Menu
						</p>
						<h2 className="heading-display mt-4 text-5xl text-[var(--color-cream)] lg:text-7xl">
							Five services.
							<br />
							<span className="heading-display-italic text-[var(--color-copper)]">No surprises.</span>
						</h2>
					</div>
					<div className="lg:col-span-5 lg:col-start-8 lg:flex lg:items-end">
						<p className="text-sm leading-relaxed text-[var(--color-cream-muted)]">
							Every service runs to a clear price and a clear time. Pick what you need, book in under a minute, and walk in fresh.
						</p>
					</div>
				</div>

				{/* Ledger */}
				<div className="mt-12 grid gap-10 lg:grid-cols-12">
					{/* Service list */}
					<ul className="lg:col-span-7">
						{services.map((service, i) => {
							const isActive = i === activeIndex;
							return (
								<li
									key={service.title}
									onMouseEnter={() => setActiveIndex(i)}
									className="group relative border-b border-[var(--color-line)] last:border-b-0"
								>
									<Link
										href={service.href}
										className="block py-7 transition-colors lg:py-9"
									>
										<div className="flex items-baseline gap-5">
											<span
												className={`text-[0.65rem] font-medium uppercase tracking-[0.28em] transition-colors ${
													isActive ? 'text-[var(--color-copper)]' : 'text-[var(--color-cream-dim)]'
												}`}
											>
												{String(i + 1).padStart(2, '0')}
											</span>
											<h3
												className={`heading-display flex-1 text-3xl transition-colors lg:text-5xl ${
													isActive ? 'text-[var(--color-cream)]' : 'text-[var(--color-cream)]/65'
												}`}
											>
												{service.title}
											</h3>
											<span className="hidden text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-cream-muted)] sm:inline">
												{service.duration}
											</span>
											<span className="heading-display text-2xl text-[var(--color-copper)] lg:text-3xl">
												{service.price}
											</span>
										</div>
										{/* Inline description (mobile + when active on desktop) */}
										<div
											className={`mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-cream-muted)] transition-all lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-32 lg:group-hover:opacity-100 ${
												isActive ? 'lg:max-h-32 lg:opacity-100' : ''
											}`}
										>
											{service.description}
										</div>
									</Link>
								</li>
							);
						})}
					</ul>

					{/* Sticky preview panel */}
					<aside className="hidden lg:col-span-5 lg:block">
						{services[activeIndex] && (
							<div className="sticky top-28">
								<div
									className="image-placeholder relative h-[60vh] w-full overflow-hidden"
									style={{
										backgroundImage: `url('/images/services/service-${activeIndex + 1}.jpg')`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
								>
									<div className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-[var(--color-bg-deep)]/95 via-[var(--color-bg-deep)]/40 to-transparent p-6">
										<div>
											<p className="text-[0.6rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
												Now Showing
											</p>
											<p className="heading-display mt-2 text-2xl text-[var(--color-cream)]">
												{services[activeIndex].title}
											</p>
										</div>
										<Link
											href={services[activeIndex].href}
											className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cream)]/40 px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:border-[var(--color-copper)] hover:text-[var(--color-copper)]"
										>
											Book
											<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
											</svg>
										</Link>
									</div>
								</div>
							</div>
						)}
					</aside>
				</div>
			</div>
		</section>
	);
}
