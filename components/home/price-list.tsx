import Link from 'next/link';
import { bookHref, money, sittingLength, type MenuSection } from '@/lib/catalog';

/** The printed price list: sections in two columns, name ...... price, each row books it. */
export function PriceList({ menu, currency }: { menu: MenuSection[]; currency: string }) {
	return (
		<div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
			{menu.map((sec) => (
				<section key={sec.slug} aria-label={sec.sign}>
					<h3 className="display text-[1.9rem] text-green">{sec.sign}</h3>
					{sec.line ? <p className="mt-1 text-sm text-ink-3">{sec.line}</p> : null}
					<ul className="mt-4">
						{sec.groups.map((g) => {
							const lens = g.options.map((o) => o.duration);
							const len = Math.min(...lens) === Math.max(...lens) ? sittingLength(lens[0]!) : `${sittingLength(Math.min(...lens))}–${sittingLength(Math.max(...lens))}`;
							return (
								<li key={g.id}>
									<Link href={bookHref({ service: g.options[0]!.slug })} className="group block py-3 transition-colors hover:text-green">
										<span className="leader">
											<span className="serif text-[1.12rem]">{g.title}</span>
											<span className="tabular text-[1.02rem]">
												{g.options.length > 1 ? <span className="text-xs text-ink-3">from </span> : null}
												{money(g.fromPrice, currency)}
											</span>
										</span>
										<span className="mt-0.5 flex justify-between gap-4 text-[0.8rem] text-ink-3">
											<span>
												{len}
												{g.options.length > 1 ? ` · ${g.options.map((o) => o.option).filter(Boolean).join(', ')}` : ''}
											</span>
											<span className="shrink-0 font-semibold text-green opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden">Book →</span>
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}
