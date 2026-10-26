import Link from 'next/link';
import type { Shop } from '@/lib/catalog';
import { NAV } from '@/lib/nav';
import { siteConfig } from '@/lib/site-config';
import { weekRows } from '@/lib/shop-hours';
import { Wordmark } from '@/components/site/wordmark';

/** Green footer: the three shops with addresses, the week's hours, contact and small print. */
export function SiteFooter({ shops }: { shops: Shop[] }) {
	const rows = weekRows();
	return (
		<footer className="bg-green-2 text-paper">
			<div className="mx-auto max-w-[1440px] px-4 pb-10 pt-16 sm:px-6 lg:px-10 lg:pt-20">
				<div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
					<div>
						<Wordmark tone="paper" />
						<p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/70">{siteConfig.description}</p>
						<Link href="/book" className="btn btn-brass mt-8">
							Book a chair
						</Link>
					</div>
					<div className="grid gap-10 sm:grid-cols-3">
						{shops.map((s) => (
							<div key={s.id}>
								<p className="label text-brass-hi">{s.area || 'Berlin'}</p>
								<Link href={`/shops/${s.slug}`} className="display mt-2 block text-2xl hover:text-brass-hi">
									{s.short}
								</Link>
								<address className="mt-3 text-sm not-italic leading-relaxed text-paper/70">
									{s.addressLines.map((l) => (
										<span key={l} className="block">
											{l}
										</span>
									))}
								</address>
								{s.transit ? <p className="mt-2 text-xs text-paper/50">{s.transit}</p> : null}
							</div>
						))}
					</div>
				</div>

				<div className="mt-14 grid gap-10 border-t border-paper/15 pt-10 sm:grid-cols-3">
					<div>
						<p className="label text-brass-hi">Hours, every shop</p>
						<dl className="mt-3 space-y-1 text-sm text-paper/75">
							{rows.map((r) => (
								<div key={r.day} className="flex justify-between gap-4">
									<dt>{r.day}</dt>
									<dd className="tabular">{r.hours}</dd>
								</div>
							))}
						</dl>
					</div>
					<div>
						<p className="label text-brass-hi">The house</p>
						<ul className="mt-3 space-y-2 text-sm">
							{NAV.map((n) => (
								<li key={n.href}>
									<Link href={n.href} className="text-paper/75 hover:text-paper">
										{n.label}
									</Link>
								</li>
							))}
							<li>
								<Link href="/account" className="text-paper/75 hover:text-paper">
									Your account
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<p className="label text-brass-hi">Get in touch</p>
						<ul className="mt-3 space-y-2 text-sm text-paper/75">
							<li>
								<a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="hover:text-paper">
									{siteConfig.contact.phone}
								</a>
							</li>
							<li>
								<a href={`mailto:${siteConfig.contact.email}`} className="hover:text-paper">
									{siteConfig.contact.email}
								</a>
							</li>
							<li className="pt-2 text-xs text-paper/50">{siteConfig.policy.cancel}</li>
						</ul>
					</div>
				</div>

				<div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 pt-6 text-xs text-paper/45">
					<p>
						© {new Date().getFullYear()} {siteConfig.legalName}. A demo store.
					</p>
					<p>
						Booking by{' '}
						<a href="https://opencals.com" className="link">
							Opencals
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
