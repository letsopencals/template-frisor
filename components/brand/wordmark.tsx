import clsx from 'clsx';

/** FRISØR in window-sign lettering. `gilt` for lacquer, `ink` on paper. */
export function Wordmark({ tone = 'gilt', className }: { tone?: 'gilt' | 'ink' | 'towel'; className?: string }) {
	return (
		<span
			className={clsx(
				'sign inline-block font-black tracking-[0.04em]',
				tone === 'gilt' && 'gilt',
				tone === 'ink' && 'text-ink',
				tone === 'towel' && 'text-towel',
				className,
			)}
		>
			Frisør
		</span>
	);
}
