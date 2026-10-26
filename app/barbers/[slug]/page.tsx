import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref, money, sittingLength } from '@/lib/catalog';
import { Mirror } from '@/components/ui/mirror';
import { GuardSign } from '@/components/ui/guard-sign';
import { TagLink } from '@/components/ui/tag';
import { ShelfPick } from '@/components/shelf/shelf-pick';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const b = (await getCatalog()).barbers.find((x) => x.slug === slug);
	return b ? { title: b.name, description: b.bio ?? `${b.name}, ${b.title} at Frisør.` } : {};
}

export default async function BarberPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const { barbers, shops, services, shelf, currency } = await getCatalog();
	const barber = barbers.find((b) => b.slug === slug);
	if (!barber) notFound();
	const signature = services.find((s) => s.slug === barber.signature) ?? null;
	const theirs = services.filter((s) => barber.services.includes(s.slug) || s.shops.some((sh) => sh.staffIds.includes(barber.id)));
	const uses = barber.uses.map((u) => shelf.find((i) => i.slug === u)).filter((i): i is NonNullable<typeof i> => !!i);
	const where = barber.shops.map((s) => shops.find((x) => x.id === s.id)).filter((s): s is NonNullable<typeof s> => !!s);

	return (
		<>
			<section className="mx-auto grid max-w-[1600px] gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20 lg:pt-20">
				<Mirror src={barber.imageUrl} name={barber.name} size={380} priority className="mx-auto max-w-full lg:mx-0" />
				<div>
					<p className="label text-brass-hi">
						{barber.title}
						{barber.years ? ` · ${barber.years} years at the chair` : ''}
					</p>
					<h1 className="sign gilt mt-4 text-[clamp(3.4rem,9vw,7.5rem)] font-black leading-[0.85]">{barber.name}</h1>
					{barber.bio ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-towel/85">{barber.bio}</p> : null}
					{barber.quote ? <blockquote className="serif mt-6 max-w-xl border-l-2 border-brass pl-5 text-2xl leading-snug text-brass-hi">“{barber.quote}”</blockquote> : null}
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<TagLink href={bookHref({ barber: barber.slug, service: signature?.slug })} size="lg">
							Book {barber.firstName}
						</TagLink>
						{where.map((s) => (
							<Link key={s.id} href={`/shops/${s.slug}`} className="label strop text-towel/75">
								{s.short} · {s.area}
							</Link>
						))}
					</div>
				</div>
			</section>

			{uses.length ? (
				<section className="border-y border-line bg-lacquer-2 py-20">
					<div className="mx-auto max-w-[1600px] px-5 sm:px-8">
						<GuardSign guard="1½" title={`What ${barber.firstName} uses`} line="Off the station, onto your docket. Packed and waiting at the chair." />
						<ul className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
							{uses.map((i) => (
								<ShelfPick key={i.id} item={i} currency={currency} />
							))}
						</ul>
					</div>
				</section>
			) : null}

			<section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
				<GuardSign guard="2" title={`Book ${barber.firstName} for`} />
				<ul className="paper deckle mt-10 px-6 pb-12 pt-6 sm:px-10">
					{theirs.map((s) => (
						<li key={s.id} className="border-b border-dashed border-towel-3 last:border-0">
							<Link href={bookHref({ service: s.slug, barber: barber.slug })} className="group flex items-end gap-3 py-4">
								<span>
									<span className="serif block text-xl text-ink group-hover:text-walnut">{s.name}</span>
									<span className="text-xs text-ink-3">
										{sittingLength(s.duration)}
										{s.slug === barber.signature ? ' · signature' : ''}
									</span>
								</span>
								<span aria-hidden className="leader" />
								<span className="serif tabular text-xl text-ink">{money(s.price, currency)}</span>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
