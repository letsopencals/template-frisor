'use client';

import { useEffect, useState, type RefObject } from 'react';

/** True once `ref` has come within `margin` of the viewport (sticky: never goes back to false). */
export function useInView(ref: RefObject<Element | null>, margin = '200px'): boolean {
	const [seen, setSeen] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el || seen) return;
		if (typeof IntersectionObserver === 'undefined') {
			setSeen(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setSeen(true);
					io.disconnect();
				}
			},
			{ rootMargin: margin },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [ref, margin, seen]);
	return seen;
}
