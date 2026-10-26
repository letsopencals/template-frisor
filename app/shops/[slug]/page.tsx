import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref } from '@/lib/catalog';
import { weekRows } from '@/lib/shop-hours';
import { directionsHref } from '@/lib/directions';
import { BarberCard } from '@/components/barbers/barber-card';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
	const { slug } = await params;
	const s = (await getCatalog()).shops.find((x) => x.slug === slug);
	return s ? { title: s.title, description: `${s.title}, ${s.addressLines.join(', ')}. ${s.tagline}` } : {};
}

/** A shop: photographs, address and hours, the way there, and who cuts here. */
export default async function ShopPage({ params }: { params: Promise<Params> }) {
	const { slug } = await params;
	const c = await getCatalog();
	const s = c.shops.find((x) => x.slug === slug);
	if (!s) notFound();
	const barbers = c.barbers.filter((b) => s.barberIds.includes(b.id));

	return (
		<>
			<section className="bg-green-2 text-paper">
				<div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[7fr_5fr] lg:gap-16 lg:px-10 lg:py-20">
					<div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[520px]">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={s.image} alt={`Inside ${s.title}`} className="h-full w-full object-cover" />
					</div>
					<div className="flex flex-col justify-center">
						<Link href="/shops" className="link text-sm text-paper/70">
							← All shops
						</Link>
						<p className="label mt-6 text-brass-hi">
							{s.area} · since {s.since}
						</p>
						<h1 className="display mt-3 text-[3rem] leading-none sm:text-7xl">{s.short}</h1>
						<p className="mt-5 text-[1.05rem] leading-relaxed text-paper/80">{s.tagline}</p>
						<address className="mt-6 not-italic">
							{s.addressLines.map((l) => (
								<span key={l} className="block">
									{l}
								</span>
							))}
							<span className="mt-1 block text-sm text-paper/60">{s.transit}</span>
						</address>
						<div className="mt-8 flex flex-wrap gap-2">
							<Link href={bookHref({ shop: s.slug })} className="btn btn-brass btn-lg">
								Book at {s.short}
							</Link>
							<a href={directionsHref(s)} target="_blank" rel="noreferrer" className="btn btn-outline-light btn-lg">
								Directions
							</a>
						</div>
					</div>
				</div>
			</section>

			<div className="mx-auto grid max-w-[1440px] gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[4fr_8fr] lg:gap-20 lg:px-10 lg:py-24">
				<div>
					<h2 className="display text-3xl">Hours</h2>
					<dl className="mt-4 text-[0.95rem]">
						{weekRows().map((r) => (
							<div key={r.day} className="leader py-1.5">
								<dt>{r.day}</dt>
								<dd className="tabular">{r.hours}</dd>
							</div>
						))}
					</dl>
					<h2 className="display mt-10 text-3xl">Good to know</h2>
					<p className="mt-3 leading-relaxed text-ink-2">{s.note}</p>
					<p className="mt-2 text-sm text-ink-3">
						{s.chairs} chairs · {barbers.length} barbers
					</p>
					<div className="mt-8 aspect-[4/5] overflow-hidden">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={s.image2} alt="" loading="lazy" className="h-full w-full object-cover" />
					</div>
				</div>
				<section aria-label={`Barbers at ${s.short}`}>
					<h2 className="display text-4xl">Who cuts here</h2>
					<div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
						{barbers.map((b) => (
							<BarberCard key={b.id} barber={b} />
						))}
					</div>
				</section>
			</div>
		</>
	);
}
