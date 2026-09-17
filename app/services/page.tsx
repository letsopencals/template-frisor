import Link from 'next/link';
import { getProducts } from '@/lib/server-data';
import { ServicesHero } from '@/components/services/services-hero';
import { ServicesList } from '@/components/services/services-list';

// Server Component: products for the default (all-locations) view are fetched
// on the server and passed to <ServicesList> as SWR fallbackData, so the list
// paints immediately. Location filtering happens client-side via SWR.
export default async function ServicesPage() {
	const products = await getProducts();

	return (
		<>
			<ServicesHero />

			<section id="services-list" className="bg-[var(--color-bg)] pb-20 lg:pb-32">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<ServicesList initialProducts={products} />
				</div>
			</section>

			<section id="services-cta" className="bg-[var(--color-gold)] py-20">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<h2 className="heading-display text-4xl text-[var(--color-bg)] md:text-5xl">
						Not sure which one?
					</h2>
					<p className="mx-auto mt-4 max-w-md text-base text-[var(--color-bg)]/75">
						Drop us a line — we&apos;ll point you at the right service and the right barber.
					</p>
					<div className="mt-8">
						<Link
							href="/contact"
							className="inline-flex items-center gap-3 rounded-full bg-[var(--color-bg)] px-10 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-all hover:bg-[var(--color-bg-deep)]"
						>
							Contact Us
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
