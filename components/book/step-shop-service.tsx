'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { money, sittingLength, toGroups, type Service, type ServiceGroup, type Shop } from '@/lib/catalog';

export interface MenuSectionRef {
	slug: string;
	sign: string;
}

function lengthRange(g: ServiceGroup): string {
	const d = g.options.map((o) => o.duration);
	const lo = Math.min(...d);
	const hi = Math.max(...d);
	return lo === hi ? sittingLength(lo) : `${sittingLength(lo)}–${sittingLength(hi)}`;
}

/**
 * Step 1: the shop as tabs, then that shop's menu as rows. A service with options opens them
 * inline under its row; choosing one calls `onChoose` (the page then moves to step 2).
 */
export function StepShopService({
	shops,
	shop,
	onShop,
	menu,
	sections,
	selected,
	onChoose,
	currency,
}: {
	shops: Shop[];
	shop: Shop | null;
	onShop: (slug: string) => void;
	menu: Service[];
	sections: MenuSectionRef[];
	selected: Service | null;
	onChoose: (slug: string) => void;
	currency: string;
}) {
	const groups = useMemo(() => toGroups(menu), [menu]);
	const [openGroup, setOpenGroup] = useState<string | null>(selected?.groupId ?? null);
	const bySection = useMemo(() => {
		const order = sections.map((s) => s.slug);
		const out = new Map<string, ServiceGroup[]>();
		for (const g of groups) {
			const key = g.section && order.includes(g.section) ? g.section : 'more';
			out.set(key, [...(out.get(key) ?? []), g]);
		}
		return [...sections, { slug: 'more', sign: 'More' }].filter((s) => out.has(s.slug)).map((s) => ({ ...s, groups: out.get(s.slug)! }));
	}, [groups, sections]);

	return (
		<div>
			<fieldset>
				<legend className="label text-ink-2">Which shop?</legend>
				<div role="radiogroup" className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
					{shops.map((s) => {
						const on = shop?.id === s.id;
						return (
							<button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => onShop(s.slug)} className="choice group flex min-h-[64px] flex-col items-start justify-center gap-0.5 px-3 py-2.5 text-left sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-2">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={s.image} alt="" className="hidden h-14 w-14 shrink-0 object-cover sm:block" />
								<span className="min-w-0">
									<span className="serif block truncate text-[0.98rem] leading-tight sm:text-lg">{s.short}</span>
									<span className={clsx('block truncate text-xs', on ? 'text-paper/75' : 'text-ink-3')}>{s.area}</span>
								</span>
							</button>
						);
					})}
				</div>
			</fieldset>

			<div className="mt-8">
				<p className="label text-ink-2">What are we doing?</p>
				{bySection.map((sec) => (
					<section key={sec.slug} className="mt-5" aria-label={sec.sign}>
						<h3 className="display text-xl text-green">{sec.sign}</h3>
						<ul className="mt-2 border-t border-paper-3">
							{sec.groups.map((g) => {
								const single = g.options.length === 1;
								const open = openGroup === g.id && !single;
								const chosenHere = selected?.groupId === g.id;
								return (
									<li key={g.id} className="border-b border-paper-3">
										<button
											type="button"
											aria-expanded={single ? undefined : open}
											aria-pressed={single ? chosenHere : undefined}
											onClick={() => (single ? onChoose(g.options[0]!.slug) : setOpenGroup(open ? null : g.id))}
											className={clsx('flex min-h-[64px] w-full items-center gap-4 px-1 py-3 text-left transition-colors hover:bg-paper-2/70', chosenHere && 'bg-paper-2')}
										>
											<span className="min-w-0 flex-1">
												<span className="serif block text-[1.08rem] leading-snug">{g.title}</span>
												<span className="block text-[0.8rem] text-ink-3">
													{lengthRange(g)}
													{single ? '' : ` · ${g.options.length} options`}
												</span>
											</span>
											<span className="tabular shrink-0 text-right text-[0.95rem]">
												{single ? '' : <span className="text-xs text-ink-3">from </span>}
												{money(g.fromPrice, currency)}
											</span>
											<span aria-hidden className={clsx('w-4 shrink-0 text-center text-ink-3 transition-transform', open && 'rotate-90')}>
												›
											</span>
										</button>
										{open ? (
											<div role="radiogroup" aria-label={`${g.title} options`} className="fade-in grid gap-2 pb-4 pl-1 sm:grid-cols-2">
												{g.options.map((o) => (
													<button key={o.id} type="button" role="radio" aria-checked={selected?.id === o.id} onClick={() => onChoose(o.slug)} className="choice flex min-h-[56px] items-center justify-between gap-3 px-4 py-2 text-left">
														<span>
															<span className="block text-[0.95rem] font-semibold">{o.option ?? g.title}</span>
															<span className={clsx('block text-xs', selected?.id === o.id ? 'text-paper/70' : 'text-ink-3')}>{sittingLength(o.duration)}</span>
														</span>
														<span className="tabular">{money(o.price, currency)}</span>
													</button>
												))}
											</div>
										) : null}
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
}
