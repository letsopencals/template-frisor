import { siteConfig } from '@/lib/site-config';

/** Auth pages: a tall shop photograph beside a narrow paper form column. */
export function AuthShell({ kicker, title, line, children }: { kicker: string; title: string; line?: string; children: React.ReactNode }) {
	return (
		<div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-2">
			<div className="relative hidden overflow-hidden bg-green-2 lg:block">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={siteConfig.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
				<span aria-hidden className="absolute inset-4 border border-paper/30" />
			</div>
			<div className="flex items-center px-4 py-14 sm:px-10 lg:px-20">
				<div className="w-full max-w-md">
					<p className="label text-brass-lo">{kicker}</p>
					<h1 className="display mt-3 text-[2.6rem] leading-[1.02] sm:text-5xl">{title}</h1>
					{line ? <p className="mt-3 text-ink-2">{line}</p> : null}
					<div className="mt-8">{children}</div>
				</div>
			</div>
		</div>
	);
}
