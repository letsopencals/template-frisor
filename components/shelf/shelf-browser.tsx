'use client';

import Link from 'next/link';
import { bookHref, money, type ShelfItem } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { shelfLines, useShelfDocket } from '@/hooks/use-shelf-docket';
import { Stepper } from '@/components/ui/stepper';

/**
 * /shelf: the products by row (hair, beard, shave, kit). With a chair already held, "Add" puts
 * the product straight on that booking; otherwise it opens booking with the product in the kit.
 */
export function ShelfBrowser({ shelf, currency }: { shelf: ShelfItem[]; currency: string }) {
	const d = useShelfDocket();
	const lines = shelfLines(d.items);
	const rows = siteConfig.shelf.rows.map((r) => ({ ...r, items: shelf.filter((s) => (s.note?.row ?? 'kit') === r.key) })).filter((r) => r.items.length);

	return (
		<div>
			{d.hasSitting ? (
				<p className="mb-10 border-l-2 border-green bg-paper-2 px-4 py-3 text-sm">
					You have a booking on hold. Anything you add here goes on it, 15% off.{' '}
					<Link href="/checkout" className="link font-semibold">
						Go to checkout
					</Link>
				</p>
			) : null}
			{rows.map((r) => (
				<section key={r.key} className="mb-16" aria-label={r.sign}>
					<h2 className="display border-b border-paper-3 pb-3 text-4xl text-green">{r.sign}</h2>
					<ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
						{r.items.map((s) => {
							const line = lines.find((l) => l.addOnId === s.id);
							return (
								<li key={s.id} className="apoth flex flex-col p-2.5">
									<div className="aspect-square overflow-hidden bg-paper-2">
										{s.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover" />
										) : null}
									</div>
									<div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
										<p className="label text-[0.58rem] text-brass-lo">No. {String(shelf.indexOf(s) + 1).padStart(2, '0')}</p>
										<h3 className="serif mt-1 text-[1.05rem] leading-snug">{s.title}</h3>
										{s.note?.use ? <p className="mt-1.5 text-[0.82rem] leading-snug text-ink-2">{s.note.use}</p> : null}
										{s.note?.facts?.length ? <p className="mt-1 text-xs text-ink-3">{s.note.facts.join(' · ')}</p> : null}
										<div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
											<span className="display text-xl">{money(s.price, currency)}</span>
											{line ? (
												<Stepper value={line.quantity} onChange={(n) => d.setQuantity(line, n)} max={s.maxQuantity ?? 9} busy={d.busy === s.id} label={s.title} tone="green" />
											) : d.hasSitting && d.targetFor(s) ? (
												<button type="button" onClick={() => void d.add(s)} disabled={d.busy === s.id} className="btn btn-outline btn-sm min-h-[44px]">
													{d.busy === s.id ? 'Adding…' : 'Add'}
												</button>
											) : (
												<Link href={bookHref({ kit: s.slug })} className="btn btn-outline btn-sm min-h-[44px]" aria-label={`Book a chair with ${s.title}`}>
													Book with it
												</Link>
											)}
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				</section>
			))}
			{d.error ? (
				<p role="alert" className="text-sm text-oxblood">
					{d.error}
				</p>
			) : null}
		</div>
	);
}
