import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { siteConfig } from '@/lib/site-config';
import type { Shop } from '@/lib/catalog';
import { NAV } from '@/lib/nav';

/** The foot of every page: the three shop doors, the hours and the house rules. */
export function Colophon({ shops }: { shops: Shop[] }) {
	return (
		<footer className="relative mt-24 border-t border-line bg-lacquer-2">
			<div className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8">
				<div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
					<div>
						<Wordmark className="text-[clamp(4rem,10vw,7.5rem)]" />
						<p className="serif mt-4 max-w-sm text-xl text-towel/85">{siteConfig.tagline}. Booked to the minute since {siteConfig.established}.</p>
						<ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
							{NAV.map((n) => (
								<li key={n.href}>
									<Link href={n.href} className="label strop text-towel/70 hover:text-towel">
										{n.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div className="grid gap-8 sm:grid-cols-3">
						{shops.map((s, i) => (
							<div key={s.id} className="border-t border-brass/40 pt-4">
								<p className="flex items-center gap-3">
									<span className="enamel !h-7 !min-w-7 !text-sm">{i + 1}</span>
									<Link href={`/shops/${s.slug}`} className="sign strop text-2xl font-bold text-towel">
										{s.short}
									</Link>
								</p>
								<address className="mt-3 text-sm not-italic leading-relaxed text-steel">
									{s.addressLines.map((l) => (
										<span key={l} className="block">
											{l}
										</span>
									))}
								</address>
								{s.transit ? <p className="mt-2 text-xs text-steel-2">{s.transit}</p> : null}
							</div>
						))}
					</div>
				</div>
				<div className="guard-rule mt-14" aria-hidden />
				<div className="mt-6 flex flex-col gap-3 text-xs text-steel-2 sm:flex-row sm:items-center sm:justify-between">
					<p>
						{siteConfig.contact.hours} ·{' '}
						<a href={`mailto:${siteConfig.contact.email}`} className="strop">
							{siteConfig.contact.email}
						</a>
					</p>
					<p>
						{siteConfig.policy.cancel} {siteConfig.policy.late}
					</p>
					<p>
						Booking by{' '}
						<a href="https://opencals.com" className="strop text-towel/70" target="_blank" rel="noreferrer">
							Opencals
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
