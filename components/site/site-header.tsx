'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { NAV } from '@/lib/nav';
import { Wordmark } from '@/components/site/wordmark';
import { OpenStrip } from '@/components/site/open-strip';
import { MobileMenu } from '@/components/site/mobile-menu';

function UserIcon() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
			<circle cx="12" cy="8.5" r="3.75" />
			<path d="M4.5 20c1.4-3.6 4.2-5.25 7.5-5.25S18.1 16.4 19.5 20" strokeLinecap="round" />
		</svg>
	);
}

function BagIcon() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
			<path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
			<path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
		</svg>
	);
}

/**
 * The sticky paper header (DESIGN.md "Navigation"): open-now strip, wordmark, centred nav,
 * account, the held booking and the Book button. Phones get a menu sheet.
 */
export function SiteHeader({ shops }: { shops: { slug: string; short: string }[] }) {
	const pathname = usePathname();
	const { status } = useSession();
	const { cart } = useCart();
	const [open, setOpen] = useState(false);
	const held = cart?.items?.length ?? 0;
	const inFlow = pathname.startsWith('/book') || pathname.startsWith('/checkout');

	useEffect(() => setOpen(false), [pathname]);

	return (
		<header className="sticky top-0 z-50">
			<OpenStrip shops={shops} />
			<div className="border-b border-paper-3 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
				<div className="mx-auto flex h-[64px] max-w-[1440px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:h-[72px] lg:px-10">
					<Link href="/" aria-label="Frisør, home" className="shrink-0">
						<Wordmark />
					</Link>

					<nav aria-label="Main" className="mx-auto hidden lg:block">
						<ul className="flex items-center gap-9">
							{NAV.map((n) => {
								const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
								return (
									<li key={n.href}>
										<Link href={n.href} aria-current={active ? 'page' : undefined} className={clsx('label py-2 text-[0.72rem] transition-colors', active ? 'text-ink underline decoration-brass decoration-2 underline-offset-[10px]' : 'text-ink-2 hover:text-ink')}>
											{n.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					<div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
						<Link href={status === 'authenticated' ? '/account' : '/auth/sign-in'} className="hidden h-11 items-center gap-2 px-2 text-ink-2 hover:text-ink sm:flex" aria-label={status === 'authenticated' ? 'Your account' : 'Sign in'}>
							<UserIcon />
							<span className="label hidden text-[0.68rem] xl:inline">{status === 'authenticated' ? 'Account' : 'Sign in'}</span>
						</Link>
						{held > 0 ? (
							<Link href="/checkout" className="relative flex h-11 items-center gap-2 px-2 text-ink-2 hover:text-ink" aria-label={`Your booking, ${held} ${held === 1 ? 'appointment' : 'appointments'} held`}>
								<BagIcon />
								<span className="absolute right-0 top-1.5 flex h-4 min-w-4 items-center justify-center bg-brass px-1 text-[0.6rem] font-bold text-paper">{held}</span>
							</Link>
						) : null}
						{inFlow ? null : (
							<Link href="/book" className="btn btn-primary btn-sm sm:min-h-[44px] sm:px-5 sm:text-[0.8125rem]">
								Book a chair
							</Link>
						)}
						<button type="button" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center text-ink lg:hidden" aria-label="Open menu" aria-expanded={open}>
							<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
								<path d="M4 8h16M4 16h16" strokeLinecap="round" />
							</svg>
						</button>
					</div>
				</div>
			</div>
			<MobileMenu open={open} onClose={() => setOpen(false)} signedIn={status === 'authenticated'} />
		</header>
	);
}
