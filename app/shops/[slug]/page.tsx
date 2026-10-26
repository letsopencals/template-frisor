import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { GuardSign } from '@/components/ui/guard-sign';
import { Mirror } from '@/components/ui/mirror';
import { TagLink } from '@/components/ui/tag';
import { HoursBoard } from '@/components/shops/hours-board';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const s = (await getCatalog()).shops.find((x) => x.slug === slug);
	return s ? { title: s.title, description: `${s.title}, ${s.addressLines.join(', ')}. ${s.tagline}` } : {};
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const { shops, barbers } = await getCatalog();
	const index = shops.findIndex((s) => s.slug === slug);
	const shop = shops[index];
	if (!shop) notFound();
	const team = barbers.filter((b) => shop.barberIds.includes(b.id));
	const map = shop.lat !== null && shop.lng !== null ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.addressLines.join(', '))}`;

	return (
		<>
			<section className="relative isolate overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={shop.image} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover" fetchPriority="high" />
				<div aria-hidden className="window-glass absolute inset-0 -z-10" />
				<div className="mx-auto max-w-[1600px] px-5 pb-16 pt-24 sm:px-8 lg:pb-24 lg:pt-40">
					<span className="enamel !h-16 !min-w-16 !text-4xl">{index + 1}</span>
					<p className="label mt-6 text-brass-hi">
						{siteConfig.name} · {shop.area} · since {shop.since}
					</p>
					<h1 className="sign gilt mt-3 text-[clamp(4rem,12vw,10rem)] font-black leading-[0.82]">{shop.short}</h1>
					<p className="serif mt-6 max-w-xl text-2xl leading-snug text-towel">{shop.tagline}</p>
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<TagLink href={bookHref({ shop: shop.slug })} size="lg">
							Take a chair here
						</TagLink>
						<a href={map} target="_blank" rel="noreferrer" className="label strop text-towel/80">
							Directions →
						</a>
					</div>
				</div>
			</section>

			<section className="mx-auto grid max-w-[1600px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-3">
				<div className="paper deckle px-6 pb-10 pt-6">
					<p className="label text-walnut">Find us</p>
					<address className="serif mt-3 text-2xl not-italic leading-snug">
						{shop.addressLines.map((l) => (
							<span key={l} className="block">
								{l}
							</span>
						))}
					</address>
					<p className="mt-4 text-sm text-ink-2">{shop.transit}</p>
					<p className="mt-4 border-t border-dashed border-towel-3 pt-4 text-sm leading-relaxed text-ink-2">{shop.note}</p>
					<p className="mt-4 text-sm text-ink-2">
						{shop.chairs} chairs ·{' '}
						<a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="strop">
							{siteConfig.contact.phone}
						</a>
					</p>
				</div>
				<HoursBoard />
				<div className="vignette relative min-h-[18rem] overflow-hidden border border-line">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={shop.image2} alt={`A corner of ${shop.title}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
				</div>
			</section>

			{team.length ? (
				<section className="mx-auto max-w-[1600px] px-5 sm:px-8">
					<GuardSign guard="1" title={`At ${shop.short}`} line={`${team.length} barbers work this shop. Book one, or let the book find the first free chair.`} />
					<ul className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
						{team.map((b) => (
							<li key={b.id} className="text-center">
								<Link href={`/barbers/${b.slug}`} className="group block">
									<Mirror src={b.imageUrl} name={b.name} size={170} className="mx-auto" />
									<p className="serif mt-4 text-lg text-towel group-hover:text-brass-hi">{b.name}</p>
									<p className="text-xs text-steel">{b.title}</p>
								</Link>
								<Link href={bookHref({ shop: shop.slug, barber: b.slug, service: b.signature })} className="label strop mt-2 inline-block text-brass">
									Book {b.firstName}
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}
		</>
	);
}
