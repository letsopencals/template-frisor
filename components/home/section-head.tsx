import Link from 'next/link';
import clsx from 'clsx';

/** A section's heading: small-caps kicker, Caslon title, optional line and link on the right. */
export function SectionHead({ kicker, title, line, href, cta, tone = 'paper' }: { kicker: string; title: string; line?: string; href?: string; cta?: string; tone?: 'paper' | 'green' }) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
			<div className="max-w-2xl">
				<p className={clsx('label', tone === 'green' ? 'text-brass-hi' : 'text-brass-lo')}>{kicker}</p>
				<h2 className="display mt-3 text-[2.4rem] leading-[1.04] sm:text-5xl">{title}</h2>
				{line ? <p className={clsx('mt-3 text-[1rem] leading-relaxed', tone === 'green' ? 'text-paper/75' : 'text-ink-2')}>{line}</p> : null}
			</div>
			{href && cta ? (
				<Link href={href} className={clsx('link text-sm font-semibold', tone === 'green' ? 'text-paper' : 'text-ink')}>
					{cta} →
				</Link>
			) : null}
		</div>
	);
}
