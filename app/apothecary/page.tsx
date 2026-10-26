import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { PageSign } from '@/components/ui/page-sign';
import { ShelfPick } from '@/components/shelf/shelf-pick';
import { ShelfHowItWorks } from '@/components/shelf/how-it-works';

export const revalidate = 300;
export const metadata: Metadata = { title: 'The shelf', description: 'Clay, pomade, beard oil, shave cream and brass razors: the products Frisør barbers use, ready at your chair when you book.' };

export default async function ApothecaryPage() {
	const { shelf, currency, barbers } = await getCatalog();
	const rows = siteConfig.shelf.rows.map((r) => ({ ...r, items: shelf.filter((i) => (i.note?.row ?? 'kit') === r.key) })).filter((r) => r.items.length);
	const usedBy = (slug: string) => barbers.filter((b) => b.uses.includes(slug)).map((b) => b.firstName);

	return (
		<>
			<PageSign kicker="The apothecary" title="The shelf" line="Everything here is what we use at the chair. Put it on your docket when you book and it's packed and waiting at your station." image={siteConfig.shelf.till} imageAlt="The till counter with the shelf behind it">
				<nav aria-label="Shelf rows" className="flex flex-wrap gap-x-6 gap-y-2">
					{rows.map((r) => (
						<Link key={r.key} href={`#${r.key}`} className="label strop text-towel/80 hover:text-towel">
							{r.sign}
						</Link>
					))}
				</nav>
			</PageSign>
			<div className="mx-auto max-w-[1600px] px-5 sm:px-8">
				{rows.map((r) => (
					<section key={r.key} id={r.key} className="scroll-mt-12 border-b border-line py-16">
						<div className="flex items-baseline justify-between gap-4">
							<h2 className="sign gilt text-6xl font-black">{r.sign}</h2>
							<p className="label text-steel">{r.items.length} on the shelf</p>
						</div>
						<ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
							{r.items.map((i) => {
								const by = usedBy(i.slug);
								return <ShelfPick key={i.id} item={i} currency={currency} note={by.length ? `${i.note?.use ?? ''} Used by ${by.slice(0, 3).join(', ')}.`.trim() : undefined} />;
							})}
						</ul>
					</section>
				))}
			</div>
			<div className="mt-20">
				<ShelfHowItWorks />
			</div>
		</>
	);
}
