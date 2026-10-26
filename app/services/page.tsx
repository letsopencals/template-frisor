import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { money } from '@/lib/catalog';
import { PageHead } from '@/components/site/page-head';
import { ServiceRow } from '@/components/services/service-row';

export const metadata: Metadata = { title: 'Services & prices', description: 'Cuts, fades, hot-towel shaves, beard work and grey blending at Frisør, Berlin. Prices include the wash, the hot towel and the finish.' };

/** /services: the full menu by section, each option bookable, with shelf pairings and in-chair extras. */
export default async function ServicesPage() {
	const c = await getCatalog();
	return (
		<>
			<PageHead kicker="Services & prices" title="The menu." line="Every service includes a consultation, the wash, a hot towel and the finish. Book any line directly; the shelf products beside each one are what your barber will use.">
				<nav aria-label="Menu sections" className="mt-8 flex flex-wrap gap-2">
					{c.menu.map((m) => (
						<Link key={m.slug} href={`#${m.slug}`} className="btn btn-outline btn-sm">
							{m.sign}
						</Link>
					))}
				</nav>
			</PageHead>
			<div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
				{c.menu.map((sec) => (
					<section key={sec.slug} id={sec.slug} className="scroll-mt-[calc(var(--header-h)+16px)] pt-10 first:pt-0" aria-label={sec.sign}>
						<div className="flex flex-wrap items-baseline justify-between gap-3 pb-2">
							<h2 className="display text-[2.4rem] text-green sm:text-5xl">{sec.sign}</h2>
							{sec.line ? <p className="text-ink-2">{sec.line}</p> : null}
						</div>
						{sec.groups.map((g) => (
							<ServiceRow key={g.id} group={g} shelf={c.shelf} currency={c.currency} />
						))}
					</section>
				))}

				{c.extras.length ? (
					<section className="mt-16 bg-green px-6 py-10 text-paper sm:px-10" aria-label="Extras">
						<p className="label text-brass-hi">While you’re in the chair</p>
						<h2 className="display mt-2 text-4xl">Add to any service</h2>
						<ul className="mt-6 grid gap-x-12 sm:grid-cols-2">
							{c.extras.map((x) => (
								<li key={x.id} className="border-b border-paper/15 py-3">
									<span className="leader [&::after]:border-paper/30">
										<span className="serif text-lg">{x.title}</span>
										<span className="tabular">+{money(x.price, c.currency)}</span>
									</span>
									{x.description ? <p className="mt-0.5 text-sm text-paper/65">{x.description}</p> : null}
								</li>
							))}
						</ul>
						<p className="mt-6 text-sm text-paper/70">Choose extras in the last step of booking.</p>
					</section>
				) : null}
			</div>
		</>
	);
}
