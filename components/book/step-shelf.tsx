'use client';

import { useMemo } from 'react';
import { money, pairsFor, type ShelfItem } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import type { ChairBooking } from '@/hooks/use-chair-booking';
import { ShelfLabel } from '@/components/shelf/shelf-label';
import { ShelfSeal } from '@/components/shelf/shelf-seal';
import { questionTitle } from '@/hooks/use-checkout-questions';

/**
 * Step 3: in-chair extras and The Shelf. "Pairs with your <service>" first, then the rest of the
 * shelf. Products are add-ons on the sitting, packed and waiting at the chair.
 */
export function StepShelf({ b, shelf, currency, onSkip }: { b: ChairBooking; shelf: ShelfItem[]; currency: string; onSkip: () => void }) {
	const sel = b.addOns.selectedAddOns;
	// Only what the store offers for this sitting, in catalogue order, with the catalogue's notes.
	const offered = useMemo(() => {
		const ids = new Set(b.shelfOffered.map((a) => a.id));
		return shelf.filter((s) => ids.has(s.id));
	}, [b.shelfOffered, shelf]);
	const ranked = pairsFor(b.service?.slug, offered);
	const pairCount = Math.min(3, (b.service && siteConfig.shelf.pairs[b.service.slug]?.length) || 0);
	const pairs = ranked.slice(0, pairCount);
	const rest = ranked.slice(pairCount);
	const lot = (s: ShelfItem) => shelf.findIndex((x) => x.id === s.id) + 1;
	const loading = b.addOns.addOnsLoading && !b.shelfOffered.length;

	const card = (s: ShelfItem, isPair: boolean) => <ShelfLabel key={s.id} item={s} lot={lot(s)} currency={currency} quantity={sel.get(s.id) ?? 0} onChange={(n) => b.addOns.updateQuantity(s.id, Math.max(0, n))} pairs={isPair} />;

	return (
		<div>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<ShelfSeal />
				<button type="button" onClick={onSkip} disabled={b.holding} className="btn btn-outline">
					Skip the shelf →
				</button>
			</div>

			{loading ? (
				<div aria-hidden className="mt-8 grid animate-pulse grid-cols-2 gap-3 lg:grid-cols-3">
					{Array.from({ length: 3 }, (_, i) => (
						<div key={i} className="aspect-[3/4] bg-paper-2" />
					))}
				</div>
			) : null}

			{pairs.length ? (
				<section className="mt-8" aria-label="Pairs well">
					<h3 className="display text-2xl text-green">Pairs with your {b.service?.groupTitle.toLowerCase()}</h3>
					<p className="mt-1 text-sm text-ink-2">What your barber reaches for, ready at your station.</p>
					<div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">{pairs.map((s) => card(s, true))}</div>
				</section>
			) : null}

			{b.extrasOffered.length ? (
				<fieldset className="mt-10">
					<legend className="label text-ink-2">While you’re in the chair</legend>
					<ul className="mt-3 grid gap-2 sm:grid-cols-2">
						{b.extrasOffered.map((x) => {
							const on = (sel.get(x.id) ?? 0) > 0;
							return (
								<li key={x.id}>
									<button type="button" role="checkbox" aria-checked={on} onClick={() => b.addOns.updateQuantity(x.id, on ? 0 : 1)} className="choice flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left">
										<span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center border border-current text-xs">
											{on ? '✓' : ''}
										</span>
										<span className="min-w-0 flex-1 text-[0.95rem] font-semibold">{x.title}</span>
										<span className="tabular">+{money(x.price, currency)}</span>
									</button>
								</li>
							);
						})}
					</ul>
				</fieldset>
			) : null}

			{rest.length ? (
				<section className="mt-10" aria-label="More from the shelf">
					<h3 className="display text-2xl text-green">More from the shelf</h3>
					<div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">{rest.map((s) => card(s, false))}</div>
				</section>
			) : null}

			{b.questions.length ? (
				<fieldset className="mt-10 max-w-xl space-y-4">
					<legend className="label text-ink-2">For your barber</legend>
					{b.questions.map((q) => (
						<div key={q.id}>
							<label htmlFor={`q-${q.id}`} className="block text-sm font-semibold">
								{questionTitle(q)}
								{q.required ? '' : <span className="font-normal text-ink-3"> (optional)</span>}
							</label>
							<textarea id={`q-${q.id}`} rows={2} value={b.answers[q.id] ?? ''} onChange={(e) => b.setAnswer(q.id, e.target.value)} className="field mt-1.5" />
						</div>
					))}
				</fieldset>
			) : null}
		</div>
	);
}
