import clsx from 'clsx';
import type { ReactNode } from 'react';

/**
 * The sign over an inner page: gold-leaf title painted on the lacquer, a sign-writer's
 * pinstripe, and an optional photo framed like a window pane beside it.
 */
export function PageSign({ kicker, title, line, image, imageAlt = '', children, className }: { kicker: string; title: string; line?: string; image?: string; imageAlt?: string; children?: ReactNode; className?: string }) {
	return (
		<header className={clsx('relative overflow-hidden border-b border-line', className)}>
			<div className={clsx('mx-auto grid max-w-[1600px] gap-10 px-5 pb-14 pt-14 sm:px-8 lg:pb-20 lg:pt-20', image && 'lg:grid-cols-[1.3fr_1fr] lg:items-end')}>
				<div>
					<p className="label flex items-center gap-3 text-brass-hi">
						<span aria-hidden className="inline-block h-px w-8 bg-brass" />
						{kicker}
					</p>
					<h1 className="sign gilt mt-5 text-[clamp(3.6rem,10vw,8.5rem)] font-black leading-[0.85]">{title}</h1>
					<div className="window-pinstripe mt-7 max-w-sm" aria-hidden />
					{line ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-towel/85">{line}</p> : null}
					{children ? <div className="mt-8">{children}</div> : null}
				</div>
				{image ? (
					<div className="vignette relative aspect-[4/3] overflow-hidden border border-line lg:aspect-[5/4]">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={image} alt={imageAlt} className="h-full w-full object-cover" fetchPriority="high" />
					</div>
				) : null}
			</div>
		</header>
	);
}
