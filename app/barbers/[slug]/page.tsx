import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref, money, sittingLength } from '@/lib/catalog';
import { ShelfTile } from '@/components/shelf/shelf-tile';
import { BarberCard } from '@/components/barbers/barber-card';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
	const { slug } = await params;
	const b = (await getCatalog()).barbers.find((x) => x.slug === slug);
	return b ? { title: b.name, description: b.bio ?? `${b.name}, ${b.title} at Frisør, Berlin.` } : {};
}

/** A barber's page: portrait, bio, signature service, where they cut, what they use. */
export default async function BarberPage({ params }: { params: Promise<Params> }) {
	const { slug } = await params;
	const c = await getCatalog();
	const b = c.barbers.find((x) => x.slug === slug);
	if (!b) notFound();
	const shops = c.shops.filter((s) => b.shops.some((x) => x.id === s.id));
	const signature = c.services.find((s) => s.slug === b.signature) ?? null;
	const uses = b.uses.map((u) => c.shelf.find((s) => s.slug === u)).filter((s) => !!s);
	const services = c.services.filter((s) => b.services.includes(s.slug));
	const others = c.barbers.filter((x) => x.id !== b.id && x.shops.some((s) => b.shops.some((y) => y.id === s.id))).slice(0, 4);

	return (
		<div className="mx-auto max-w-[1440px] px-4 pb-24 pt-8 sm:px-6 lg:px-10 lg:pt-14">
			<Link href="/barbers" className="link text-sm text-ink-2">
				← All barbers
			</Link>
			<div className="mt-6 grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-20">
				<div className="relative aspect-[4/5] overflow-hidden bg-green-2">
					{b.imageUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={b.imageUrl} alt={b.name} className="h-full w-full object-cover" />
					) : null}
					<span aria-hidden className="absolute inset-3 border border-paper/40" />
				</div>
				<div>
					<p className="label text-brass-lo">{b.title}</p>
					<h1 className="display mt-3 text-[3rem] leading-none sm:text-7xl">{b.name}</h1>
					{b.bio ? <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-ink-2">{b.bio}</p> : null}
					{b.quote ? <blockquote className="serif mt-6 max-w-xl border-l-2 border-brass pl-5 text-xl leading-snug">“{b.quote}”</blockquote> : null}

					<dl className="mt-8 grid max-w-xl grid-cols-2 gap-y-5 border-t border-paper-3 pt-6 text-sm">
						{b.years ? (
							<div>
								<dt className="label text-[0.6rem] text-ink-3">In the chair</dt>
								<dd className="mt-1">{b.years} years</dd>
							</div>
						) : null}
						<div>
							<dt className="label text-[0.6rem] text-ink-3">Cuts at</dt>
							<dd className="mt-1">{shops.map((s) => s.short).join(', ')}</dd>
						</div>
						{b.known.length ? (
							<div className="col-span-2">
								<dt className="label text-[0.6rem] text-ink-3">Known for</dt>
								<dd className="mt-1">{b.known.join(' · ')}</dd>
							</div>
						) : null}
					</dl>

					<div className="mt-8 flex flex-wrap gap-2">
						<Link href={bookHref({ barber: b.slug, shop: shops[0]?.slug })} className="btn btn-primary btn-lg">
							Book with {b.firstName}
						</Link>
						{signature ? (
							<Link href={bookHref({ barber: b.slug, service: signature.slug, shop: shops[0]?.slug })} className="btn btn-outline btn-lg">
								{signature.name} · {money(signature.price, c.currency)}
							</Link>
						) : null}
					</div>

					{services.length ? (
						<section className="mt-12" aria-label="Services">
							<h2 className="display text-3xl">What {b.firstName} does</h2>
							<ul className="mt-4 max-w-xl">
								{services.map((s) => (
									<li key={s.id}>
										<Link href={bookHref({ barber: b.slug, service: s.slug, shop: shops[0]?.slug })} className="block py-2.5 hover:text-green">
											<span className="leader">
												<span>
													{s.name} <span className="text-sm text-ink-3">· {sittingLength(s.duration)}</span>
												</span>
												<span className="tabular">{money(s.price, c.currency)}</span>
											</span>
										</Link>
									</li>
								))}
							</ul>
						</section>
					) : null}
				</div>
			</div>

			{uses.length ? (
				<section className="mt-20 border-t border-paper-3 pt-12" aria-label={`What ${b.firstName} uses`}>
					<h2 className="display text-4xl">What {b.firstName} uses</h2>
					<p className="mt-2 text-ink-2">Add any of these when you book and they’re waiting at the chair.</p>
					<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{uses.map((s) => (
							<ShelfTile key={s!.id} item={s!} lot={c.shelf.indexOf(s!) + 1} currency={c.currency} href={bookHref({ barber: b.slug, shop: shops[0]?.slug, kit: s!.slug })} />
						))}
					</div>
				</section>
			) : null}

			{others.length ? (
				<section className="mt-20 border-t border-paper-3 pt-12" aria-label="Also at this shop">
					<h2 className="display text-4xl">Also at {shops[0]?.short}</h2>
					<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
						{others.map((o) => (
							<BarberCard key={o.id} barber={o} />
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}
