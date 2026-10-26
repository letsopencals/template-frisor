import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import type { Shop } from '@/lib/catalog';
import { TagLink } from '@/components/ui/tag';
import { ChairsToday, type ChairsShop } from '@/components/home/chairs-today';

/**
 * The shop window: a full-bleed photo seen through glass, gold-leaf lettering painted on it,
 * and the live "Chairs today" board hanging inside (DESIGN.md "Hero").
 */
export function WindowHero({ shops, probe }: { shops: Shop[]; probe: ChairsShop[] }) {
	const { hero } = siteConfig;
	return (
		<section className="relative isolate overflow-hidden">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={siteConfig.house.image} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_40%]" fetchPriority="high" />
			<div aria-hidden className="window-glass absolute inset-0 -z-10" />

			<div className="mx-auto grid min-h-[calc(100svh-var(--counter-pad)-2.25rem)] max-w-[1600px] gap-10 px-5 pb-12 pt-14 sm:px-8 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:pb-16">
				<div className="self-center">
					<p className="label flex items-center gap-3 text-brass-hi">
						<span aria-hidden className="inline-block h-px w-8 bg-brass" />
						{hero.kicker}
					</p>
					<h1 className="sign mt-6 font-black">
						<span className="gilt block text-[clamp(4.2rem,13vw,11.5rem)] leading-[0.82]">{hero.lines[0]}</span>
						<span className="gilt block text-[clamp(4.2rem,13vw,11.5rem)] leading-[0.82]">{hero.lines[1]}</span>
					</h1>
					<div className="window-pinstripe mt-8 max-w-md" aria-hidden />
					<p className="mt-6 max-w-lg text-lg leading-relaxed text-towel/90">{hero.body}</p>
					<div className="mt-9 flex flex-wrap items-center gap-4">
						<TagLink href="/book" size="lg">
							Take a chair
						</TagLink>
						<TagLink href="/menu" size="lg" variant="line" style={{ ['--tag-fill' as string]: 'rgba(24,33,31,0.88)' }}>
							Read the menu
						</TagLink>
						<Link href="/apothecary" className="label strop text-towel/80 hover:text-towel">
							Browse the shelf →
						</Link>
					</div>
				</div>

				<ChairsToday shops={shops.map((s) => ({ id: s.id, slug: s.slug, short: s.short, area: s.area, chairs: s.chairs, barbers: s.barberIds.length }))} probe={probe} />
			</div>
		</section>
	);
}
