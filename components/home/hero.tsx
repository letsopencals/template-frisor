import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

/** One full-bleed photograph of the shop, the headline set large over it, one action. */
export function Hero({ barbers, shops }: { barbers: number; shops: number }) {
	return (
		<section className="relative isolate overflow-hidden bg-green-2 text-paper">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={siteConfig.house.image} alt="Inside Frisør Mitte: walnut chairs, round mirrors and bottle-green walls" className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center]" fetchPriority="high" />
			<div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,44,35,0.92)_0%,rgba(22,44,35,0.7)_42%,rgba(22,44,35,0.15)_75%)] max-lg:bg-[linear-gradient(0deg,rgba(22,44,35,0.95)_10%,rgba(22,44,35,0.55)_60%,rgba(22,44,35,0.25)_100%)]" />
			<div className="mx-auto flex min-h-[calc(100svh-var(--header-h))] max-w-[1440px] flex-col justify-end px-4 pb-12 pt-40 sm:px-6 lg:min-h-[640px] lg:justify-center lg:px-10 lg:py-24">
				<p className="label text-brass-hi">{siteConfig.hero.kicker}</p>
				<h1 className="display mt-4 max-w-[11ch] text-[3.4rem] leading-[0.98] sm:text-7xl lg:text-[6.4rem]">{siteConfig.hero.lines.join(' ')}</h1>
				<p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-paper/80">{siteConfig.hero.body}</p>
				<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
					<Link href="/book" className="btn btn-brass btn-lg">
						Book a chair
					</Link>
					<Link href="/services" className="link text-sm text-paper/85">
						See the menu and prices
					</Link>
				</div>
				<dl className="mt-12 flex gap-8 border-t border-paper/20 pt-5 text-sm">
					{[
						[String(shops), 'shops in Berlin'],
						[String(barbers), 'barbers'],
						[String(siteConfig.established), 'first chair'],
					].map(([n, l]) => (
						<div key={l}>
							<dt className="sr-only">{l}</dt>
							<dd>
								<span className="display block text-3xl text-brass-hi">{n}</span>
								<span className="text-paper/65">{l}</span>
							</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
