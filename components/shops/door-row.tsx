import Link from 'next/link';
import { bookHref, type Barber, type Shop } from '@/lib/catalog';
import { Mirror } from '@/components/ui/mirror';
import { Swivel } from '@/components/ui/swivel';
import { TagLink } from '@/components/ui/tag';

/** A shop on /shops: the door photo with its number plate, then the facts and who's in. */
export function DoorRow({ shop, index, barbers }: { shop: Shop; index: number; barbers: Barber[] }) {
	const team = barbers.filter((b) => shop.barberIds.includes(b.id));
	return (
		<Swivel as="article" from={index % 2 ? 'right' : 'left'} className="grid gap-8 border-t border-line py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
			<Link href={`/shops/${shop.slug}`} className="vignette group relative block aspect-[4/3] overflow-hidden border border-line">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={shop.image} alt={`Inside ${shop.title}`} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" loading={index ? 'lazy' : 'eager'} />
				<span className="enamel absolute left-5 top-5 z-10 !h-14 !min-w-14 !text-3xl">{index + 1}</span>
			</Link>
			<div className="flex flex-col">
				<p className="label text-brass-hi">
					{shop.area} · since {shop.since}
				</p>
				<h2 className="sign gilt mt-3 text-[clamp(3rem,7vw,5.5rem)] font-black leading-[0.85]">{shop.short}</h2>
				<p className="serif mt-5 text-2xl leading-snug text-towel">{shop.tagline}</p>
				<address className="mt-5 text-sm not-italic leading-relaxed text-steel">
					{shop.addressLines.join(', ')}
					<br />
					{shop.transit}
				</address>
				{team.length ? (
					<ul className="mt-6 flex -space-x-3" aria-label={`Barbers at ${shop.short}`}>
						{team.map((b) => (
							<li key={b.id} title={b.name}>
								<Mirror src={b.imageUrl} name={b.name} size={56} className="!p-[3px]" />
							</li>
						))}
					</ul>
				) : null}
				<div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
					<TagLink href={bookHref({ shop: shop.slug })}>Book at {shop.short}</TagLink>
					<Link href={`/shops/${shop.slug}`} className="label strop text-towel/75">
						The shop →
					</Link>
				</div>
			</div>
		</Swivel>
	);
}
