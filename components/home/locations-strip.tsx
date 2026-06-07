'use client';

import { useRouter } from 'next/navigation';
import type { Location } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { useLocation } from '@/contexts/location-context';

function formatAddress(loc: Location): string[] {
	if (loc.type === 'online') return ['Online location'];
	const lines: string[] = [];
	if (loc.addressLine1) lines.push(loc.addressLine1);
	const cityLine = [loc.city, loc.state].filter(Boolean).join(', ');
	const cityPostal = [cityLine, loc.postalCode].filter(Boolean).join(' ');
	if (cityPostal) lines.push(cityPostal);
	return lines.length > 0 ? lines : ['Address coming soon'];
}

function cityLabel(loc: Location): string {
	if (loc.type === 'online') return 'Online';
	return loc.city ?? loc.title ?? 'Shop';
}

export function LocationsStrip() {
	const { locations, setSelectedLocationId, loading } = useLocation();
	const router = useRouter();
	const { locations: copy } = siteConfig;

	// After load: hide section if API returned nothing
	if (!loading && locations.length === 0) return null;

	const slots = copy.cards;
	const visibleCount = loading ? slots.length : Math.min(locations.length, slots.length);
	const gridColsClass = visibleCount === 1
		? 'lg:grid-cols-1'
		: visibleCount === 2
			? 'lg:grid-cols-2'
			: 'lg:grid-cols-3';

	const handlePick = (loc: Location) => {
		setSelectedLocationId(loc.id);
		router.push('/services');
	};

	return (
		<section className="relative bg-[var(--color-bg)] py-20 lg:py-32">
			<div className="mx-auto max-w-[1500px] px-6 lg:px-10">
				<div className="grid gap-6 border-b border-[var(--color-line)] pb-8 lg:grid-cols-12">
					<div className="lg:col-span-6">
						<p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-[var(--color-copper)]">
							{copy.eyebrow}
						</p>
						<h2 className="heading-display mt-4 whitespace-pre-line text-4xl text-[var(--color-cream)] lg:text-6xl">
							{copy.heading}
						</h2>
					</div>
					<div className="lg:col-span-5 lg:col-start-8 lg:flex lg:items-end">
						<p className="text-sm leading-relaxed text-[var(--color-cream-muted)]">{copy.body}</p>
					</div>
				</div>

				<div className={`mt-12 grid gap-6 ${gridColsClass}`}>
					{Array.from({ length: visibleCount }).map((_, i) => {
						const slot = slots[i]!;
						const loc = loading ? null : locations[i] ?? null;
						const disabled = loading || !loc;

						return (
							<button
								key={i}
								type="button"
								onClick={() => loc && handlePick(loc)}
								disabled={disabled}
								aria-disabled={disabled}
								className="group relative flex flex-col text-left transition-opacity disabled:cursor-default"
							>
								<div
									className="image-placeholder relative aspect-[4/5] w-full overflow-hidden"
									style={{
										backgroundImage: `url('/images/${slot.image}')`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
								>
									<div className="absolute top-3 left-3 rounded-full bg-[var(--color-bg-deep)]/70 px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-copper)] backdrop-blur-sm">
										{String(i + 1).padStart(2, '0')}
									</div>
									<div className="absolute inset-0 bg-[var(--color-bg-deep)]/0 transition-colors group-hover:bg-[var(--color-bg-deep)]/30" />
									{loc && (
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/40 to-transparent p-5">
											<p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--color-copper)]">
												{slot.tagline}
											</p>
											<h3 className="heading-display mt-2 text-3xl text-[var(--color-cream)] lg:text-4xl">
												{cityLabel(loc)}
											</h3>
										</div>
									)}
								</div>

								<div className="mt-5 flex flex-col gap-3">
									{loc ? (
										<>
											<div className="space-y-1 text-sm text-[var(--color-cream-muted)]">
												{formatAddress(loc).map((line, idx) => (
													<p key={idx}>{line}</p>
												))}
											</div>
											<div className="flex items-center justify-between pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em]">
												<span className="text-[var(--color-cream-dim)]">{slot.hoursHint}</span>
												<span className="text-[var(--color-copper)] transition-transform group-hover:translate-x-1">
													Book at this chair →
												</span>
											</div>
										</>
									) : (
										<>
											<div className="h-4 w-3/4 rounded bg-[var(--color-surface)]/40" />
											<div className="h-4 w-1/2 rounded bg-[var(--color-surface)]/40" />
										</>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
