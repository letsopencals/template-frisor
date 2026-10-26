import clsx from 'clsx';

/** Steam wisps rising over hot-towel moments (DESIGN.md "Motion"). Decorative. */
export function Steam({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 120 80" fill="none" aria-hidden className={clsx('steam', className)}>
			<path d="M30 78c-8-12 8-18 0-30s8-18 0-30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<path d="M60 78c-8-12 8-18 0-30s8-18 0-30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<path d="M90 78c-8-12 8-18 0-30s8-18 0-30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}
