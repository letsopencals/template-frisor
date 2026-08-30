'use client';

import type { ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';

interface StaffSelectorProps {
	staffMembers: StaffMember[];
	selected: string | null;
	onSelect: (staffMemberId: string | null) => void;
	hideLabel?: boolean;
}

function getImageUrl(staff: StaffMember): string | null {
	const img = staff.image as { url?: string } | undefined;
	return img?.url ?? null;
}

function getInitials(staff: StaffMember): string {
	const first = (staff.firstName?.[0] ?? '').toUpperCase();
	const last = (staff.lastName?.[0] ?? '').toUpperCase();
	return `${first}${last}` || (staff.email?.[0]?.toUpperCase() ?? '?');
}

export function StaffSelector({ staffMembers, selected, onSelect, hideLabel = false }: StaffSelectorProps) {
	if (staffMembers.length === 0) return null;

	return (
		<div>
			{!hideLabel && (
				<p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--color-cream-dim)]">
					Choose your barber
				</p>
			)}
			<div className={`no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 ${hideLabel ? '' : 'mt-4'}`}>
				{/* "Any" card */}
				<button
					type="button"
					onClick={() => onSelect(null)}
					className={`group flex w-[120px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border transition-all ${
						selected === null
							? 'border-[var(--color-copper)] bg-[var(--color-copper)]/10'
							: 'border-[var(--color-line-strong)] bg-[var(--color-surface-2)]/30 hover:border-[var(--color-copper)]/40'
					}`}
				>
					<div className="image-placeholder flex aspect-[3/4] w-full items-center justify-center">
						<svg className="h-10 w-10 text-[var(--color-cream)]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div className="px-3 py-2.5">
						<p className={`text-[0.7rem] font-semibold uppercase tracking-[0.18em] ${selected === null ? 'text-[var(--color-copper)]' : 'text-[var(--color-cream)]'}`}>
							Any Barber
						</p>
						<p className="text-[0.55rem] uppercase tracking-[0.2em] text-[var(--color-cream-dim)]">
							Next available
						</p>
					</div>
				</button>

				{staffMembers.map((staff) => {
					const imageUrl = getImageUrl(staff);
					const name = staff.firstName ?? 'Staff';
					const isSelected = selected === staff.id;

					return (
						<button
							key={staff.id}
							type="button"
							onClick={() => onSelect(staff.id)}
							className={`group flex w-[120px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border transition-all ${
								isSelected
									? 'border-[var(--color-copper)] bg-[var(--color-copper)]/10'
									: 'border-[var(--color-line-strong)] hover:border-[var(--color-copper)]/40'
							}`}
						>
							<div className="image-placeholder relative aspect-[3/4] w-full overflow-hidden">
								{imageUrl ? (
									<img src={imageUrl} alt={name} className="h-full w-full object-cover object-top" />
								) : (
									<div className="flex h-full w-full items-center justify-center">
										<span className="heading-display text-3xl text-[var(--color-cream)]/70">
											{getInitials(staff)}
										</span>
									</div>
								)}
								{isSelected && (
									<div className="absolute inset-0 ring-2 ring-inset ring-[var(--color-copper)]" />
								)}
							</div>
							<div className="px-3 py-2.5">
								<p className={`truncate text-[0.7rem] font-semibold uppercase tracking-[0.18em] ${isSelected ? 'text-[var(--color-copper)]' : 'text-[var(--color-cream)]'}`}>
									{name}
								</p>
								<p className="truncate text-[0.55rem] uppercase tracking-[0.2em] text-[var(--color-cream-dim)]">
									{staff.lastName ?? 'Master barber'}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
