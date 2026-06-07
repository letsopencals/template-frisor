import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function BarbersShowcase() {
	const { team } = siteConfig;

	return (
		<section className="relative bg-[var(--color-bg-deep)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1500px] px-6 lg:px-10">
				<div className="flex items-end justify-between border-b border-[var(--color-line)] pb-8">
					<div>
						<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
							Behind The Chair
						</p>
						<h2 className="heading-display mt-4 text-4xl text-[var(--color-cream)] lg:text-6xl">
							Meet the <span className="heading-display-italic text-[var(--color-copper)]">barbers</span>
						</h2>
					</div>
					<Link
						href="/about#team"
						className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] link-underline sm:inline"
					>
						See the full team →
					</Link>
				</div>

				<div className="no-scrollbar -mx-6 mt-12 flex snap-x snap-mandatory overflow-x-auto px-6 lg:mx-0 lg:px-0">
					{team.map((barber, i) => (
						<article
							key={barber.name}
							className="group relative mr-4 flex w-[72%] shrink-0 snap-start flex-col last:mr-0 sm:w-[44%] lg:mr-6 lg:w-[22%]"
						>
							<div
								className="image-placeholder relative aspect-[3/4] w-full overflow-hidden"
								style={{
									backgroundImage: `url('/images/${barber.image}')`,
									backgroundSize: 'cover',
									backgroundPosition: 'center top',
								}}
							>
								<div className="absolute top-3 left-3 rounded-full bg-[var(--color-bg-deep)]/70 px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-copper)] backdrop-blur-sm">
									{String(i + 1).padStart(2, '0')}
								</div>
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/40 to-transparent p-5">
									<p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--color-copper)]">
										{barber.role}
									</p>
									<h3 className="heading-display mt-2 text-2xl text-[var(--color-cream)]">{barber.name}</h3>
								</div>
							</div>
							<div className="mt-4 flex items-center justify-between">
								<p className="text-xs uppercase tracking-[0.18em] text-[var(--color-cream-muted)]">
									{barber.specialty}
								</p>
								<Link
									href="/services"
									className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-colors hover:text-[var(--color-copper)]"
								>
									Book →
								</Link>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
