import clsx from 'clsx';
import { siteConfig } from '@/lib/site-config';

/** The SHELF15 seal: an oval brass cartouche saying the shelf saving is applied for you. */
export function ShelfSeal({ className, tone = 'paper' }: { className?: string; tone?: 'paper' | 'green' }) {
	const code = siteConfig.shelf.autoCode;
	if (!code) return null;
	return (
		<div className={clsx('flex items-center gap-4', className)}>
			<span className={clsx('cartouche flex h-14 w-24 shrink-0 flex-col items-center justify-center', tone === 'green' ? 'text-brass-hi' : 'text-brass-lo')}>
				<span className="display text-xl leading-none">15%</span>
				<span className="label text-[0.5rem]">off</span>
			</span>
			<p className={clsx('max-w-xs text-sm leading-snug', tone === 'green' ? 'text-paper/80' : 'text-ink-2')}>
				<span className={clsx('font-semibold', tone === 'green' ? 'text-paper' : 'text-ink')}>{siteConfig.shelf.autoCodeLabel}.</span> Code {code} goes on by itself at checkout.
			</p>
		</div>
	);
}
