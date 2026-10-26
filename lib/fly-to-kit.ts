/**
 * "Into the kit" (DESIGN.md "Motion"): a ghost of the product image flies from where it was
 * added into the Counter bar's running tab, which bumps. Client-only; does nothing under
 * prefers-reduced-motion or when either end is missing.
 */
export function flyToKit(from: Element | null, image: string | null) {
	if (typeof window === 'undefined' || !from || !image) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const target = [...document.querySelectorAll<HTMLElement>('[data-kit-target]')].find((el) => el.offsetParent !== null);
	if (!target) return;
	const a = from.getBoundingClientRect();
	const b = target.getBoundingClientRect();
	const size = Math.min(96, a.width, a.height);
	const ghost = document.createElement('img');
	ghost.src = image;
	ghost.alt = '';
	ghost.className = 'kit-ghost';
	Object.assign(ghost.style, { left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px`, objectFit: 'cover' });
	document.body.appendChild(ghost);
	requestAnimationFrame(() => {
		const dx = b.left + b.width / 2 - (a.left + a.width / 2);
		const dy = b.top + b.height / 2 - (a.top + a.height / 2);
		ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.25) rotate(-12deg)`;
		ghost.style.opacity = '0.2';
	});
	window.setTimeout(() => {
		ghost.remove();
		target.classList.remove('tab-bump');
		void target.offsetWidth;
		target.classList.add('tab-bump');
	}, 720);
}
