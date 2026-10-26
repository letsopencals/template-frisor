import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { PageSign } from '@/components/ui/page-sign';
import { GuardSign } from '@/components/ui/guard-sign';
import { ServiceGroupRow } from '@/components/menu/service-group';
import { ExtrasBoard } from '@/components/menu/extras-board';
import { TagLink } from '@/components/ui/tag';

export const revalidate = 300;
export const metadata: Metadata = { title: 'The menu', description: 'Cuts, fades, beard work and hot-towel shaves at Frisør, Berlin. Every price, every option, booked to the minute.' };

export default async function MenuPage() {
	const { menu, shelf, extras, currency } = await getCatalog();
	return (
		<>
			<PageSign kicker="The menu" title="Cuts, shaves & the ritual" line="One price per service, whichever barber and whichever shop. Every sitting ends with a hot towel." image={siteConfig.house.detail} imageAlt="A barber's station with clippers and a hot towel">
				<nav aria-label="Menu sections" className="flex flex-wrap gap-x-6 gap-y-2">
					{menu.map((s) => (
						<Link key={s.slug} href={`#${s.slug}`} className="label strop text-towel/80 hover:text-towel">
							{s.sign}
						</Link>
					))}
				</nav>
			</PageSign>
			<div className="mx-auto max-w-[1600px] px-5 sm:px-8">
				{menu.map((section, i) => (
					<section key={section.slug} id={section.slug} className="scroll-mt-12 pt-20">
						<GuardSign guard={siteConfig.guards[i] ?? String(i)} title={section.sign} line={section.line} />
						<div className="mt-10">
							{section.groups.map((g) => (
								<ServiceGroupRow key={g.id} group={g} shelf={shelf} currency={currency} />
							))}
						</div>
					</section>
				))}
				<ExtrasBoard extras={extras} currency={currency} />
				<div className="mt-16 flex justify-center">
					<TagLink href="/book" size="lg">
						Take a chair
					</TagLink>
				</div>
			</div>
		</>
	);
}
