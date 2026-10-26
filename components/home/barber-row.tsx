import Link from 'next/link';
import type { Barber, Shop } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { GuardSign } from '@/components/ui/guard-sign';
import { Mirror } from '@/components/ui/mirror';

/**
 * The row of station mirrors: every barber in their round brass mirror, as you see them
 * walking down the shop. Hovering a mirror turns the light on in it.
 */
export function BarberRow({ barbers, shops }: { barbers: Barber[]; shops: Shop[] }) {
	const shopName = (id: string) => shops.find((s) => s.id === id)?.short;
	return (
		<section className="relative border-y border-line bg-lacquer-2 py-24 lg:py-32">
			<div className="mx-auto max-w-[1600px] px-5 sm:px-8">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<GuardSign guard={siteConfig.guards[2]!} title="The chairs" line={`${barbers.length} barbers across ${shops.length} shops. Pick the one you want, or take the first free chair.`} />
					<Link href="/barbers" className="label strop text-brass-hi">
						Meet every barber →
					</Link>
				</div>
			</div>
			<ul className="mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto px-5 pb-6 sm:px-8 lg:gap-12" aria-label="Barbers">
				{barbers.map((b) => (
					<li key={b.id} className="w-[13rem] shrink-0 snap-start text-center">
						<Link href={`/barbers/${b.slug}`} className="group block">
							<Mirror src={b.imageUrl} name={b.name} size={196} className="mx-auto transition-[filter] duration-500 [filter:brightness(0.82)_saturate(0.85)] group-hover:[filter:none]" />
							<p className="serif mt-5 text-xl text-towel group-hover:text-brass-hi">{b.name}</p>
							<p className="mt-1 text-xs text-steel">{b.title}</p>
							<p className="label mt-2 text-brass/80">{b.shops.map((s) => shopName(s.id)).filter(Boolean).join(' · ')}</p>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
