'use client';

import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

export function QuoteSlab() {
	const { testimonials } = siteConfig;
	const [index, setIndex] = useState(0);
	const current = testimonials[index];

	function next() {
		setIndex((i) => (i + 1) % testimonials.length);
	}

	if (!current) return null;

	return (
		<section className="relative overflow-hidden bg-[var(--color-surface)] py-24 lg:py-40">
			{/* Oversized faded quote glyph */}
			<div className="pointer-events-none absolute -top-20 -left-10 select-none lg:-top-40 lg:-left-16">
				<span className="heading-display block text-[20rem] leading-none text-[var(--color-copper)]/8 lg:text-[34rem]">
					&ldquo;
				</span>
			</div>

			<div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="flex items-end justify-between border-b border-[var(--color-line-strong)] pb-6">
					<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
						What People Say
					</p>
					<span className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream-dim)]">
						{String(index + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
					</span>
				</div>

				<blockquote className="mt-14 max-w-5xl">
					<p className="heading-display-italic text-3xl leading-[1.15] text-[var(--color-cream)] sm:text-4xl lg:text-6xl">
						&ldquo;{current.quote}&rdquo;
					</p>
					<footer className="mt-12 flex items-center justify-between border-t border-[var(--color-line-strong)] pt-6">
						<div>
							<cite className="not-italic text-base font-medium text-[var(--color-cream)]">
								{current.author}
							</cite>
							<p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[var(--color-cream-muted)]">
								{current.role}
							</p>
						</div>
						<button
							onClick={next}
							className="group flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:text-[var(--color-copper)]"
						>
							Next
							<span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line-strong)] transition-colors group-hover:border-[var(--color-copper)]">
								<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</span>
						</button>
					</footer>
				</blockquote>
			</div>
		</section>
	);
}
