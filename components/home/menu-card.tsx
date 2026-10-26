import Link from 'next/link';
import { bookHref, money, sittingLength, type MenuSection } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { GuardSign } from '@/components/ui/guard-sign';
import { Swivel } from '@/components/ui/swivel';
import { TagLink } from '@/components/ui/tag';

/**
 * The printed price card, as it hangs by the door: every service with dotted leaders, grouped
 * by the menu's sections. Each line books that service.
 */
export function MenuCard({ menu, currency }: { menu: MenuSection[]; currency: string }) {
	return (
		<section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:py-32">
			<div className="grid gap-12 lg:grid-cols-[0.8fr_1.6fr] lg:gap-20">
				<div className="lg:sticky lg:top-12 lg:self-start">
					<GuardSign guard={siteConfig.guards[0]!} title="The menu" line="Every price is the price. Booked to the minute, with your barber, at the shop you choose. Hot towel included." />
					<TagLink href="/menu" variant="line" className="mt-8">
						The full menu
					</TagLink>
				</div>

				<Swivel from="right">
					<div className="paper deckle relative px-6 pb-12 pt-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] sm:px-10 sm:pt-10">
						<div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
							<p className="sign text-3xl font-black text-ink">Price list</p>
							<p className="label text-ink-2">{siteConfig.name} · Berlin</p>
						</div>
						<div className="mt-6 grid gap-x-12 gap-y-9 md:grid-cols-2">
							{menu.map((section) => (
								<div key={section.slug}>
									<p className="label text-walnut">{section.sign}</p>
									<ul className="mt-3 space-y-3">
										{section.groups.map((g) => {
											const first = g.options[0]!;
											return (
												<li key={g.id}>
													<Link href={bookHref({ service: first.slug })} className="group flex items-end gap-2">
														<span className="serif text-[1.15rem] leading-tight text-ink group-hover:text-walnut">{g.title}</span>
														<span aria-hidden className="leader" />
														<span className="tabular whitespace-nowrap text-sm text-ink-2">
															{g.options.length > 1 ? 'from ' : ''}
															<span className="serif text-[1.15rem] text-ink">{money(g.fromPrice, currency)}</span>
														</span>
													</Link>
													<p className="mt-0.5 text-xs text-ink-3">
														{g.options.length > 1 ? g.options.map((o) => o.option).join(' · ') : sittingLength(first.duration)}
													</p>
												</li>
											);
										})}
									</ul>
								</div>
							))}
						</div>
						<p className="mt-10 border-t border-dashed border-towel-3 pt-4 text-xs text-ink-2">
							Prices include VAT. {siteConfig.policy.cancel}
						</p>
					</div>
				</Swivel>
			</div>
		</section>
	);
}
