import { money } from '@/lib/catalog';

/** In-chair extras, chalked up like a side board: added in the booking, done in the same sitting. */
export function ExtrasBoard({ extras, currency }: { extras: { id: string; title: string; description: string | null; price: number }[]; currency: string }) {
	if (!extras.length) return null;
	return (
		<section className="board mx-auto mt-10 max-w-3xl border-b-[10px] px-6 py-8 sm:px-10">
			<p className="board-letters text-center text-sm tracking-[0.3em] text-towel/60">— In the same sitting —</p>
			<ul className="mt-6 space-y-4">
				{extras.map((e) => (
					<li key={e.id}>
						<div className="flex items-baseline gap-3">
							<span className="board-letters text-xl text-towel">{e.title}</span>
							<span aria-hidden className="mb-1 flex-1 border-b border-dotted border-towel/30" />
							<span className="board-letters tabular text-lg text-brass-hi">+{money(e.price, currency)}</span>
						</div>
						{e.description ? <p className="mt-1 text-xs text-towel/55">{e.description}</p> : null}
					</li>
				))}
			</ul>
			<p className="mt-6 text-center text-xs text-towel/50">Pick them when you book. Your barber adds the time.</p>
		</section>
	);
}
