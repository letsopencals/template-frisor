import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { ShelfSeal } from '@/components/shelf/shelf-seal';
import { ShelfBrowser } from '@/components/shelf/shelf-browser';

export const metadata: Metadata = { title: 'The Shelf', description: 'Clay, pomade, beard oil, shave cream and razors: what Frisør uses at the chair. Add them to a booking and they’re waiting at your station, 15% off.' };

/** /shelf: the apothecary. Products are add-ons, so they're bought with a booking and picked up at the chair. */
export default async function ShelfPage() {
	const c = await getCatalog();
	return (
		<>
			<section className="relative isolate overflow-hidden bg-green-2 text-paper">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={siteConfig.shelf.wall} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45" />
				<div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
					<p className="label text-brass-hi">The Shelf</p>
					<h1 className="display mt-3 max-w-3xl text-[2.8rem] leading-[1.02] sm:text-7xl">What we use at the chair.</h1>
					<p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/80">Everything here is on the counter at every station. Add it to a booking and it’s packed and waiting when you sit down; pay with your appointment.</p>
					<ShelfSeal tone="green" className="mt-8" />
				</div>
			</section>
			<div className="mx-auto max-w-[1440px] px-4 pb-16 pt-14 sm:px-6 lg:px-10">
				<ShelfBrowser shelf={c.shelf} currency={c.currency} />
			</div>
		</>
	);
}
