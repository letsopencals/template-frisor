'use client';

import clsx from 'clsx';
import { money, sittingLength, toGroups } from '@/lib/catalog';
import { nextFreeLabel } from '@/lib/when';
import type { ChairBooking } from '@/hooks/use-chair-booking';
import { Mirror } from '@/components/ui/mirror';

/** Zone one of /book: what you're having, at which shop, with whom. All on one plate, no steps. */
export function ChairPicker({ b, currency }: { b: ChairBooking; currency: string }) {
	const groups = toGroups(b.services);
	return (
		<div className="space-y-9">
			<fieldset>
				<legend className="label text-brass">1 · The service</legend>
				<div className="mt-3 divide-y divide-line border-y border-line">
					{groups.map((g) => {
						const active = g.options.some((o) => o.slug === b.service?.slug);
						return (
							<div key={g.id} className="py-2.5">
								<button type="button" onClick={() => b.chooseService(g.options[0]!.slug)} className="flex w-full items-baseline justify-between gap-3 text-left" aria-pressed={active}>
									<span className={clsx('serif text-lg', active ? 'text-brass-hi' : 'text-towel')}>{g.title}</span>
									<span className="tabular text-sm text-steel">{g.options.length > 1 ? 'from ' : ''}{money(g.fromPrice, currency)}</span>
								</button>
								{active && g.options.length > 1 ? (
									<div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${g.title} options`}>
										{g.options.map((o) => (
											<button
												key={o.id}
												type="button"
												role="radio"
												aria-checked={o.slug === b.service?.slug}
												onClick={() => b.chooseService(o.slug)}
												className={clsx('border px-2.5 py-1.5 text-left text-xs', o.slug === b.service?.slug ? 'border-brass bg-brass text-ink' : 'border-line text-towel/80 hover:border-brass/60')}
											>
												<span className="block font-semibold">{o.option}</span>
												<span className="tabular">{sittingLength(o.duration)} · {money(o.price, currency)}</span>
											</button>
										))}
									</div>
								) : active ? (
									<p className="mt-1 text-xs text-steel">{sittingLength(g.options[0]!.duration)}</p>
								) : null}
							</div>
						);
					})}
				</div>
			</fieldset>

			<fieldset>
				<legend className="label text-brass">2 · The shop</legend>
				<div className="mt-3 grid gap-2" role="radiogroup" aria-label="Shop">
					{b.offered.map((s, i) => {
						const on = s.id === b.shop?.id;
						const next = b.nextByShop[s.id];
						return (
							<button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => b.chooseShop(s.slug)} className={clsx('flex items-center gap-3 border p-2.5 text-left transition-colors', on ? 'border-brass bg-felt' : 'border-line hover:border-brass/50')}>
								<span className="enamel !h-8 !min-w-8 !text-base">{i + 1}</span>
								<span className="min-w-0 flex-1">
									<span className="sign block text-xl font-bold leading-none text-towel">{s.short}</span>
									<span className="text-xs text-steel">{s.area}</span>
								</span>
								<span className="text-right text-[0.7rem] text-steel">
									{next === undefined || b.loading ? '…' : next ? <>next<br /><span className="text-brass-hi">{nextFreeLabel(next.at, b.timeZone)}</span></> : 'full'}
								</span>
							</button>
						);
					})}
				</div>
			</fieldset>

			<fieldset>
				<legend className="label text-brass">3 · The barber</legend>
				<div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-5 lg:grid-cols-3" role="radiogroup" aria-label="Barber">
					<button type="button" role="radio" aria-checked={b.staffChoice === 'any'} onClick={() => b.chooseBarber('any')} className="flex flex-col items-center gap-1.5 text-center">
						<span className={clsx('mirror flex aspect-square w-16 items-center justify-center !p-[3px]', b.staffChoice !== 'any' && 'opacity-60')}>
							<span className="sign flex h-full w-full items-center justify-center bg-lacquer-2 text-[0.7rem] font-bold leading-tight text-brass-hi">FIRST<br />FREE</span>
						</span>
						<span className={clsx('text-xs', b.staffChoice === 'any' ? 'text-brass-hi' : 'text-towel/70')}>Any barber</span>
					</button>
					{b.candidates.map((c) => {
						const on = b.staffChoice === c.id;
						return (
							<button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => b.chooseBarber(c.id)} className="flex flex-col items-center gap-1.5 text-center">
								<Mirror src={c.imageUrl} name={c.name} size={64} className={clsx('!p-[3px] transition-opacity', !on && 'opacity-60 hover:opacity-100')} />
								<span className={clsx('text-xs leading-tight', on ? 'text-brass-hi' : 'text-towel/70')}>{c.firstName}</span>
							</button>
						);
					})}
				</div>
			</fieldset>
		</div>
	);
}
