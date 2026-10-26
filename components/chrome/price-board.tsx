'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { NAV, type BoardFacts } from '@/lib/nav';
import { siteConfig } from '@/lib/site-config';

/**
 * The price board: a grooved felt letter board that slides up out of the counter, the way
 * barbershops post their prices. The menu on phones; on desktop it's reachable from the bar too.
 */
export function PriceBoard({ open, onClose, facts }: { open: boolean; onClose: () => void; facts: BoardFacts }) {
	const panel = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		panel.current?.querySelector<HTMLElement>('a')?.focus();
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	return (
		<>
			<div
				aria-hidden
				onClick={onClose}
				className={clsx('fixed inset-0 z-40 bg-black/60 transition-opacity duration-300', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
			/>
			<div
				id="price-board"
				ref={panel}
				role="dialog"
				aria-modal="true"
				aria-label="Site menu"
				inert={!open}
				className={clsx(
					'board fixed inset-x-0 z-[45] mx-auto max-w-xl px-5 pb-6 pt-5 transition-transform duration-500 ease-[var(--ease-chair)]',
					open ? 'translate-y-0' : 'translate-y-[110%]',
				)}
				style={{ bottom: 'var(--counter-pad)' }}
			>
				<p className="board-letters text-center text-[0.8rem] tracking-[0.3em] text-towel/60">— PRICE BOARD —</p>
				<ul className="mt-4">
					{NAV.map((item) => (
						<li key={item.href}>
							<Link href={item.href} onClick={onClose} className="board-row group flex items-baseline gap-3 py-2.5">
								<span className="board-letters text-[1.65rem] leading-none text-towel group-hover:text-brass-hi">{item.board}</span>
								<span aria-hidden className="mb-1 flex-1 border-b border-dotted border-towel/30" />
								<span className="board-letters text-sm text-brass-hi">{facts[item.href] ?? ''}</span>
							</Link>
						</li>
					))}
				</ul>
				<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-towel/15 pt-4 text-xs text-towel/70">
					<a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="strop">
						{siteConfig.contact.phone}
					</a>
					<span>{siteConfig.contact.hours}</span>
				</div>
			</div>
		</>
	);
}
