'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx';

const TABS = [
	{ href: '/account', label: 'Visits' },
	{ href: '/account/orders', label: 'Orders' },
	{ href: '/account/profile', label: 'Profile' },
] as const;

/** The account frame: greeting, tabs (Visits, Orders, Profile) and sign out. */
export function AccountShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data } = useSession();
	const first = data?.customer?.firstName;
	return (
		<div className="mx-auto max-w-[1200px] px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-16">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="label text-brass-lo">Your account</p>
					<h1 className="display mt-2 text-[2.6rem] leading-none sm:text-6xl">{first ? `Hello, ${first}.` : 'Hello.'}</h1>
				</div>
			</div>
			<nav aria-label="Account" className="mt-8 flex items-center gap-1 border-b border-paper-3">
				{TABS.map((t) => {
					const active = t.href === '/account' ? pathname === '/account' || pathname.startsWith('/account/visits') : pathname.startsWith(t.href);
					return (
						<Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined} className={clsx('label -mb-px flex min-h-[48px] items-center border-b-2 px-3 text-[0.7rem] sm:px-4', active ? 'border-green text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
							{t.label}
						</Link>
					);
				})}
				<button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="link ml-auto min-h-[44px] text-sm text-ink-3">
					Sign out
				</button>
			</nav>
			<div className="pt-8">{children}</div>
		</div>
	);
}
