'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { Wordmark } from '@/components/brand/wordmark';
import { TagLink } from '@/components/ui/tag';
import { PriceBoard } from '@/components/chrome/price-board';
import { RunningTab } from '@/components/chrome/running-tab';
import { NAV, type BoardFacts } from '@/lib/nav';
import { tabOf } from '@/lib/tab';
import '@/styles/counter.css';

/**
 * The Counter bar (DESIGN.md "Navigation model"): fixed at the bottom on every screen size,
 * like the shop counter you walk up to. Wordmark, the links, the running tab and "Take a chair".
 * On phones the links live on the price board, which opens upward.
 */
export function CounterBar({ facts }: { facts: BoardFacts }) {
	const pathname = usePathname();
	const { cart } = useCart();
	const tab = tabOf(cart);
	const [open, setOpen] = useState(false);
	const onBook = pathname === '/book' || pathname.startsWith('/checkout');

	useEffect(() => setOpen(false), [pathname]);

	return (
		<>
			<PriceBoard open={open} onClose={() => setOpen(false)} facts={facts} />
			<nav aria-label="Main" className="counter fixed inset-x-0 bottom-0 z-50">
				<div className="mx-auto flex h-[var(--counter-h)] max-w-[1600px] items-center gap-3 px-3 sm:px-5 lg:gap-8 lg:px-8">
					<Link href="/" className="flex shrink-0 items-baseline gap-3" aria-label="Frisør, home">
						<Wordmark className="text-[1.9rem] lg:text-[2.2rem]" />
						<span className="label hidden text-steel xl:inline">Barbers &amp; apothecary</span>
					</Link>

					<ul className="hidden flex-1 items-center justify-center gap-7 lg:flex">
						{NAV.map((item) => {
							const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										aria-current={active ? 'page' : undefined}
										className={clsx('label strop py-2 transition-colors', active ? 'text-brass-hi' : 'text-towel/80 hover:text-towel')}
									>
										{item.label}
									</Link>
								</li>
							);
						})}
					</ul>

					<div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
						<RunningTab tab={tab} />
						<button
							type="button"
							onClick={() => setOpen((v) => !v)}
							aria-expanded={open}
							aria-controls="price-board"
							className="label flex h-10 items-center gap-2 border border-line px-3 text-towel lg:hidden"
						>
							<span aria-hidden className="flex flex-col gap-[3px]">
								<span className="block h-px w-4 bg-brass" />
								<span className="block h-px w-4 bg-brass" />
								<span className="block h-px w-3 bg-brass" />
							</span>
							Board
						</button>
						{onBook ? null : (
							<TagLink href="/book" size="sm" className="lg:!h-11 lg:!px-6">
								<span className="lg:hidden">Book</span>
								<span className="hidden lg:inline">Take a chair</span>
							</TagLink>
						)}
					</div>
				</div>
			</nav>
		</>
	);
}
