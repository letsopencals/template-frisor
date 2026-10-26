import { siteConfig } from '@/lib/site-config';
import { Steam } from '@/components/ui/steam';
import { Swivel } from '@/components/ui/swivel';

/**
 * The hot towel and the house rules: the steam photo with real steam rising over it, and the
 * four rules numbered by guard like the comb set on the station.
 */
export function HouseRules() {
	const { house } = siteConfig;
	return (
		<section className="paper relative">
			<div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
				<div className="relative min-h-[22rem] overflow-hidden lg:min-h-[40rem]">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={house.steam} alt="A hot towel steaming on a brass tray" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
					<Steam className="absolute left-[18%] top-[14%] w-40 text-towel/80" />
				</div>
				<div className="px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
					<p className="label text-walnut">House rules</p>
					<h2 className="sign mt-3 text-[clamp(2.6rem,6vw,4.5rem)] font-black text-ink">Every sitting ends with a hot towel.</h2>
					<ol className="mt-10 divide-y divide-towel-3 border-y border-towel-3">
						{house.principles.map((p) => (
							<Swivel as="li" key={p.title} className="grid grid-cols-[4.5rem_1fr] gap-4 py-6">
								<span className="sign text-4xl font-black text-walnut">
									<span className="block text-[0.6rem] font-semibold tracking-[0.2em] text-ink-3">GUARD</span>
									{p.guard}
								</span>
								<span>
									<span className="serif block text-2xl text-ink">{p.title}</span>
									<span className="mt-1 block text-[0.95rem] leading-relaxed text-ink-2">{p.body}</span>
								</span>
							</Swivel>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
