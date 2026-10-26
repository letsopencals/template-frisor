'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { NAV } from '@/lib/nav';
import { siteConfig } from '@/lib/site-config';
import { Wordmark } from '@/components/site/wordmark';

/** Phone menu: a full-height green sheet with the nav set large, account and contact. */
export function MobileMenu({ open, onClose, signedIn }: { open: boolean; onClose: () => void; signedIn: boolean }) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		document.addEventListener('keydown', onKey);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = '';
		};
	}, [open, onClose]);

	if (!open) return null;
	return (
		<div role="dialog" aria-modal="true" aria-label="Menu" className="fade-in fixed inset-0 z-[60] flex flex-col bg-green-2 text-paper lg:hidden">
			<div className="flex h-[64px] items-center justify-between px-4 sm:px-6">
				<Link href="/" onClick={onClose} aria-label="Frisør, home">
					<Wordmark tone="paper" />
				</Link>
				<button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center" aria-label="Close menu">
					<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
						<path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
					</svg>
				</button>
			</div>
			<nav aria-label="Main" className="flex-1 overflow-y-auto px-4 pt-6 sm:px-6">
				<ul className="divide-y divide-paper/15 border-y border-paper/15">
					{[{ href: '/', label: 'Home' }, ...NAV, { href: signedIn ? '/account' : '/auth/sign-in', label: signedIn ? 'Your account' : 'Sign in' }].map((n) => (
						<li key={n.href}>
							<Link href={n.href} onClick={onClose} className="display flex min-h-[60px] items-center justify-between text-[1.9rem]">
								{n.label}
								<span aria-hidden className="text-base text-brass-hi">→</span>
							</Link>
						</li>
					))}
				</ul>
				<p className="mt-8 text-sm text-paper/70">{siteConfig.contact.hours}</p>
				<p className="mt-1 text-sm text-paper/70">{siteConfig.contact.phone}</p>
			</nav>
			<div className="p-4 sm:p-6">
				<Link href="/book" onClick={onClose} className="btn btn-brass btn-lg w-full">
					Book a chair
				</Link>
			</div>
		</div>
	);
}
