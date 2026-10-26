import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { PageSign } from '@/components/ui/page-sign';
import { StationCard } from '@/components/barbers/station-card';

export const metadata: Metadata = { title: 'The barbers', description: 'Thirteen barbers across Mitte, Kreuzberg and Prenzlauer Berg. Pick yours and book their chair.' };

export default async function BarbersPage({ searchParams }: { searchParams: Promise<{ shop?: string }> }) {
	const [{ shop }, { barbers, shops, services }] = await Promise.all([searchParams, getCatalog()]);
	const current = shops.find((s) => s.slug === shop) ?? null;
	const list = current ? barbers.filter((b) => b.shops.some((s) => s.id === current.id)) : barbers;
	const chip = (active: boolean) => clsx('label border px-3 py-2 transition-colors', active ? 'border-brass bg-brass text-ink' : 'border-line text-towel/75 hover:border-brass/60');

	return (
		<>
			<PageSign kicker={`${barbers.length} chairs, ${shops.length} shops`} title="The barbers" line="Every barber does every cut on the menu. Some of them are famous for one. Book the person, or take the first free chair." image={siteConfig.gallery[1]} imageAlt="A barber at work in front of the station mirror">
				<nav aria-label="Filter by shop" className="flex flex-wrap gap-2">
					<Link href="/barbers" className={chip(!current)} aria-current={!current ? 'page' : undefined}>
						All shops
					</Link>
					{shops.map((s) => (
						<Link key={s.id} href={`/barbers?shop=${s.slug}`} className={chip(current?.id === s.id)} aria-current={current?.id === s.id ? 'page' : undefined}>
							{s.short}
						</Link>
					))}
				</nav>
			</PageSign>
			<ul className="mx-auto mt-14 grid max-w-[1600px] gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4">
				{list.map((b) => (
					<StationCard key={b.id} barber={b} shops={shops} signature={services.find((s) => s.slug === b.signature) ?? null} />
				))}
			</ul>
		</>
	);
}
