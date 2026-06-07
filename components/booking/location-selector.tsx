'use client';

import type { Location } from '@opencals/storefront-sdk';

interface LocationSelectorProps {
	locations: Location[];
	selected: string | null;
	onSelect: (locationId: string) => void;
}

function formatCity(location: Location): string | null {
	if (location.type === 'online') return 'Online';
	return location.city ?? null;
}

export function LocationSelector({ locations, selected, onSelect }: LocationSelectorProps) {
	if (locations.length === 0) return null;

	// Single location — small read-only chip
	if (locations.length === 1) {
		const loc = locations[0]!;
		const city = formatCity(loc);
		return (
			<div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)]">
				<svg className="h-3.5 w-3.5 text-[var(--color-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				{loc.title ?? 'Location'}
				{city && <span className="text-[var(--color-cream-dim)]">· {city}</span>}
			</div>
		);
	}

	return (
		<div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto">
			{locations.map((loc) => {
				const isActive = loc.id === selected;
				const city = formatCity(loc);
				return (
					<button
						key={loc.id}
						role="tab"
						aria-selected={isActive}
						type="button"
						onClick={() => onSelect(loc.id)}
						className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] transition-all ${
							isActive
								? 'border-[var(--color-copper)] bg-[var(--color-copper)] text-[var(--color-bg-deep)]'
								: 'border-[var(--color-line-strong)] text-[var(--color-cream)] hover:border-[var(--color-copper)]/40'
						}`}
					>
						<svg className={`h-3.5 w-3.5 ${isActive ? 'text-[var(--color-bg-deep)]' : 'text-[var(--color-copper)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						<span>{loc.title ?? 'Location'}</span>
						{city && (
							<span className={isActive ? 'text-[var(--color-bg-deep)]/70' : 'text-[var(--color-cream-dim)]'}>
								· {city}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
