import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function EndRail() {
	const { bookingBanner } = siteConfig;

	return (
		<section className="relative bg-[var(--color-bg)]">
			<div className="grid min-h-[55vh] lg:grid-cols-12">
				{/* Left: vertical wordmark rail */}
				<div className="relative hidden bg-[var(--color-bg-deep)] lg:col-span-2 lg:flex lg:items-center lg:justify-center">
					<div className="writing-vertical heading-display text-7xl text-[var(--color-copper)]">
						BOOK NOW
					</div>
				</div>

				{/* Middle: copper CTA panel */}
				<div className="relative flex flex-col justify-center bg-[var(--color-copper)] px-6 py-20 lg:col-span-7 lg:px-16">
					<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-bg-deep)]/70">
						{bookingBanner.heading[0]}
					</p>
					<h2 className="heading-display mt-6 text-5xl text-[var(--color-bg-deep)] lg:text-7xl">
						<span className="heading-display-italic">{bookingBanner.headingAccent}</span>
					</h2>
					<p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-bg-deep)]/85">
						{bookingBanner.body}
					</p>
					<div className="mt-10">
						<Link
							href={bookingBanner.cta.href}
							className="group inline-flex items-center gap-3 rounded-full bg-[var(--color-bg-deep)] px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:bg-[var(--color-bg)]"
						>
							{bookingBanner.cta.label}
							<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</div>
				</div>

				{/* Right: small interior photo */}
				<div
					className="image-placeholder relative bg-[var(--color-surface)] lg:col-span-3"
					style={{
						backgroundImage: `url('/images/hero/end-rail.jpg')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				>
					{/* Diagonal seam between copper and image */}
				</div>
			</div>
		</section>
	);
}
