import Link from 'next/link';
import type { Shop } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { GuardSign } from '@/components/ui/guard-sign';

/** The three doors: each shop as a tall photo with its enamel number plate and street. */
export function ShopDoors({ shops }: { shops: Shop[] }) {
	return (
		<section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:py-32">
			<GuardSign guard={siteConfig.guards[5]!} title="Three doors" line="Same menu, same prices, same hot towels. Different records on the turntable." />
			<ul className="mt-14 grid gap-6 md:grid-cols-3">
				{shops.map((s, i) => (
					<li key={s.id}>
						<Link href={`/shops/${s.slug}`} className="group block">
							<div className="vignette relative aspect-[3/4] overflow-hidden border border-line">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={s.image} alt={`Inside ${s.title}`} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" loading="lazy" />
								<span className="enamel absolute left-4 top-4 z-10 !h-12 !min-w-12 !text-2xl">{i + 1}</span>
								<div className="absolute inset-x-0 bottom-0 z-10 p-5">
									<p className="label text-brass-hi">{s.area}</p>
									<p className="sign gilt mt-1 text-5xl font-black">{s.short}</p>
								</div>
							</div>
							<p className="mt-4 text-sm text-towel/85">{s.tagline}</p>
							<p className="mt-1 text-xs text-steel">
								{s.addressLines[0]} · {s.transit}
							</p>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
