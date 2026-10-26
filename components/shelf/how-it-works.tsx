import { siteConfig } from '@/lib/site-config';

const STEPS = [
	{ n: '1', title: 'Add it to your booking', body: 'Pick it beside your time, or on the docket before you pay. One price, paid with your sitting.' },
	{ n: '2', title: 'It waits at your station', body: 'Packed in our paper bag with your name on it, on the shelf under your mirror.' },
	{ n: '3', title: 'Try it in the chair', body: 'Your barber finishes with it, so you see how much to use. Not right? Swap it at the till.' },
];

/** The shelf's three steps, printed like the back of a receipt. */
export function ShelfHowItWorks() {
	return (
		<section className="paper">
			<div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr] lg:py-20">
				<div>
					<p className="label text-walnut">How the shelf works</p>
					<p className="sign mt-3 text-5xl font-black text-ink">Bought with the booking. Waiting at the chair.</p>
					{siteConfig.shelf.autoCode ? <p className="mt-4 text-sm text-ink-2">{siteConfig.shelf.autoCodeLabel}, applied on the docket.</p> : null}
				</div>
				<ol className="grid gap-6 sm:grid-cols-3">
					{STEPS.map((s) => (
						<li key={s.n} className="border-t-2 border-ink pt-4">
							<span className="sign text-5xl font-black text-walnut">{s.n}</span>
							<p className="serif mt-2 text-xl text-ink">{s.title}</p>
							<p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
