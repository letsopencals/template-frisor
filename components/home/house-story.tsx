import { siteConfig } from '@/lib/site-config';

/** The house: a tall photo, the story and four house rules, on green. */
export function HouseStory() {
	const h = siteConfig.house;
	return (
		<section className="bg-green text-paper">
			<div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:px-10 lg:py-28">
				<div className="aspect-[4/5] overflow-hidden">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={h.steam} alt="A hot towel rolled on a brass tray beside a razor and shaving brush" loading="lazy" className="h-full w-full object-cover" />
				</div>
				<div className="flex flex-col justify-center">
					<p className="label text-brass-hi">The house</p>
					<h2 className="display mt-3 text-[2.4rem] leading-[1.04] sm:text-5xl">Booked to the minute. Never rushed.</h2>
					<div className="mt-6 max-w-xl space-y-4 text-[1.02rem] leading-relaxed text-paper/80">
						{h.story.map((p) => (
							<p key={p}>{p}</p>
						))}
					</div>
					<ul className="mt-10 grid gap-x-10 gap-y-6 border-t border-paper/20 pt-8 sm:grid-cols-2">
						{h.principles.map((p) => (
							<li key={p.title}>
								<p className="serif text-lg text-brass-hi">{p.title}</p>
								<p className="mt-1 text-sm leading-relaxed text-paper/70">{p.body}</p>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
