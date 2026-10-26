import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { PageHead } from '@/components/site/page-head';
import { BarberCard } from '@/components/barbers/barber-card';

export const metadata: Metadata = { title: 'Barbers', description: 'Thirteen barbers across three Berlin shops. Book one by name, or take the first free chair.' };

/** /barbers: every barber, grouped by shop. */
export default async function BarbersPage() {
	const c = await getCatalog();
	return (
		<>
			<PageHead kicker="The barbers" title={`${c.barbers.length} barbers, three shops.`} line="Book a barber by name, or choose “any barber” for the most times. Whoever you sit with does the whole service, start to finish." />
			<div className="mx-auto max-w-[1440px] space-y-16 px-4 pb-24 sm:px-6 lg:px-10">
				{c.shops.map((s) => {
					const here = c.barbers.filter((b) => s.barberIds.includes(b.id));
					if (!here.length) return null;
					return (
						<section key={s.id} aria-label={s.short}>
							<div className="flex items-baseline justify-between gap-4 border-b border-paper-3 pb-3">
								<h2 className="display text-4xl text-green">{s.short}</h2>
								<p className="text-sm text-ink-3">{s.area}</p>
							</div>
							<div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
								{here.map((b) => (
									<BarberCard key={b.id} barber={b} />
								))}
							</div>
						</section>
					);
				})}
			</div>
		</>
	);
}
