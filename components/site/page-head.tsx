/** A page's opening: small-caps kicker, large Caslon title, a line of intro, a double rule. */
export function PageHead({ kicker, title, line, children }: { kicker: string; title: string; line?: string; children?: React.ReactNode }) {
	return (
		<header className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-6 lg:px-10 lg:pb-14 lg:pt-20">
			<p className="label text-brass-lo">{kicker}</p>
			<h1 className="display mt-3 max-w-4xl text-[2.8rem] leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h1>
			{line ? <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">{line}</p> : null}
			{children}
			<div className="rule-double mt-10 text-ink" />
		</header>
	);
}
