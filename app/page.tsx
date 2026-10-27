import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { Hero } from '@/components/home/hero';
import { SectionHead } from '@/components/home/section-head';
import { PriceList } from '@/components/home/price-list';
import { HouseStory } from '@/components/home/house-story';
import { BarberCard } from '@/components/barbers/barber-card';
import { ShopPanel } from '@/components/shops/shop-panel';
import { ShelfTile } from '@/components/shelf/shelf-tile';
import { ShelfSeal } from '@/components/shelf/shelf-seal';

const WRAP = 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10';

/** Home (DESIGN.md "Page composition"): hero, price list, barbers, the shelf, the house, the shops. */
export default async function HomePage() {
	const c = await getCatalog();
	const shelf = c.shelf.slice(0, 4);
	return (
		<>
			<Hero barbers={c.barbers.length} shops={c.shops.length} />

			<section id="menu" className={`${WRAP} py-20 lg:py-28`}>
				<SectionHead kicker="The menu" title="Cuts, shaves and the long sit." line="Every price includes the wash, the hot towel and the finish. Tap a line to book it." href="/services" cta="The full menu" />
				<div className="mt-12">
					<PriceList menu={c.menu} currency={c.currency} />
				</div>
			</section>

			<section id="barbers" className="border-y border-paper-3 bg-paper-2/60">
				<div className={`${WRAP} py-20 lg:py-28`}>
					<SectionHead kicker="The barbers" title={`${c.barbers.length} pairs of hands.`} line="Choose one by name, or take the first free chair. Every barber does the whole service, start to finish." href="/barbers" cta="Meet them all" />
					<div className="no-scrollbar -mx-4 mt-12 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
						{c.barbers.slice(0, 6).map((b) => (
							<div key={b.id} className="w-[62vw] shrink-0 snap-start sm:w-auto">
								<BarberCard barber={b} />
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="shelf" className={`${WRAP} py-20 lg:py-28`}>
				<div className="grid gap-12 lg:grid-cols-[4fr_8fr] lg:gap-16">
					<div className="flex flex-col">
						<SectionHead kicker="The Shelf" title="What we use at the chair, to take home." line="Add anything when you book and it’s packed and waiting at your station." />
						<ShelfSeal className="mt-8" />
						<div className="mt-8 hidden overflow-hidden lg:block">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={siteConfig.shelf.wall} alt="The apothecary wall at Frisør Mitte" loading="lazy" className="aspect-[16/10] w-full object-cover" />
						</div>
						<Link href="/shelf" className="btn btn-outline mt-8 self-start">
							Browse the shelf
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:gap-4">
						{shelf.map((s) => (
							<ShelfTile key={s.id} item={s} lot={c.shelf.indexOf(s) + 1} currency={c.currency} />
						))}
					</div>
				</div>
			</section>

			<HouseStory />

			<section id="shops" className={`${WRAP} py-20 lg:py-28`}>
				<SectionHead kicker="The shops" title="Three doors in Berlin." line={`Open ${siteConfig.contact.hours}.`} href="/shops" cta="All shops" />
				<div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-6 lg:gap-10">
					{c.shops.map((s) => (
						<ShopPanel key={s.id} shop={s} barberCount={s.barberIds.length} />
					))}
				</div>
			</section>
		</>
	);
}
