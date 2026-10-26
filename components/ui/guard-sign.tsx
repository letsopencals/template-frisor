import clsx from 'clsx';

/**
 * A section sign, numbered by clipper guard instead of 01/02/03: "No. 1½ · The Shelf".
 * The guard-comb rule runs under it.
 */
export function GuardSign({
	guard,
	title,
	line,
	tone = 'lacquer',
	className,
	as: Tag = 'h2',
}: {
	guard: string;
	title: string;
	line?: string;
	tone?: 'lacquer' | 'paper';
	className?: string;
	as?: 'h1' | 'h2' | 'h3';
}) {
	const muted = tone === 'paper' ? 'text-ink-2' : 'text-steel';
	return (
		<div className={clsx('max-w-3xl', className)}>
			<p className={clsx('label flex items-center gap-3', tone === 'paper' ? 'text-walnut' : 'text-brass')}>
				<span aria-hidden className="inline-block h-px w-6 bg-current" />
				Guard No. {guard}
			</p>
			<Tag className={clsx('sign mt-3 text-[clamp(2.6rem,6vw,4.75rem)] font-extrabold', tone === 'paper' ? 'text-ink' : 'gilt')}>{title}</Tag>
			{line ? <p className={clsx('mt-4 max-w-xl text-base leading-relaxed', muted)}>{line}</p> : null}
			<div className="guard-rule mt-6 max-w-sm" aria-hidden />
		</div>
	);
}
