'use client';

import clsx from 'clsx';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Swivel (DESIGN.md "Motion"): the block turns in on its vertical axis once, like a barber's
 * chair turning to face you. No stagger cascades. Reduced motion shows it straight away (CSS).
 */
export function Swivel({ children, from = 'left', className, as: Tag = 'div' }: { children: ReactNode; from?: 'left' | 'right'; className?: string; as?: 'div' | 'section' | 'li' | 'article' }) {
	const ref = useRef<HTMLElement | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof IntersectionObserver === 'undefined') {
			el.classList.add('is-in');
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					el.classList.add('is-in');
					io.disconnect();
				}
			},
			{ rootMargin: '0px 0px -8% 0px' },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return (
		<Tag ref={ref as never} className={clsx('swivel', from === 'right' && 'swivel--right', className)}>
			{children}
		</Tag>
	);
}
