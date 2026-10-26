import clsx from 'clsx';

/** The Frisør wordmark: Caslon caps with a small "Barbers & Apothecary · Berlin" line under it. */
export function Wordmark({ tone = 'ink', compact = false, className }: { tone?: 'ink' | 'paper'; compact?: boolean; className?: string }) {
	return (
		<span className={clsx('inline-flex flex-col leading-none', tone === 'paper' ? 'text-paper' : 'text-ink', className)}>
			<span className="display text-[1.75rem] tracking-[0.06em] sm:text-[2rem]">FRISØR</span>
			{compact ? null : <span className={clsx('label mt-1 text-[0.56rem] tracking-[0.24em]', tone === 'paper' ? 'text-brass-hi' : 'text-brass-lo')}>Barbers &amp; Apothecary · Berlin</span>}
		</span>
	);
}
