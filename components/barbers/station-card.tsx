import Link from 'next/link';
import { bookHref, type Barber, type Service, type Shop } from '@/lib/catalog';
import { Mirror } from '@/components/ui/mirror';
import { Swivel } from '@/components/ui/swivel';

/** A barber's station: the mirror, the brass name plate under it, and what they're known for. */
export function StationCard({ barber, shops, signature }: { barber: Barber; shops: Shop[]; signature: Service | null }) {
	const where = barber.shops.map((s) => shops.find((x) => x.id === s.id)?.short).filter(Boolean);
	return (
		<Swivel as="li" className="group relative flex flex-col items-center border border-line bg-lacquer-2 px-6 pb-7 pt-9 text-center">
			<Link href={`/barbers/${barber.slug}`} className="flex flex-col items-center">
				<Mirror src={barber.imageUrl} name={barber.name} size={210} />
				<span className="paper mt-[-14px] relative z-10 px-4 py-1.5 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.8)]">
					<span className="serif block text-xl leading-tight">{barber.name}</span>
				</span>
			</Link>
			<p className="mt-3 text-sm text-steel">
				{barber.title}
				{barber.years ? ` · ${barber.years} yrs` : ''}
			</p>
			{where.length ? <p className="label mt-2 text-brass">{where.join(' · ')}</p> : null}
			{barber.known.length ? (
				<ul className="mt-4 flex flex-wrap justify-center gap-1.5">
					{barber.known.map((k) => (
						<li key={k} className="border border-line px-2 py-0.5 text-[0.7rem] text-towel/75">
							{k}
						</li>
					))}
				</ul>
			) : null}
			<div className="mt-auto flex w-full items-center justify-between gap-3 pt-6">
				<Link href={`/barbers/${barber.slug}`} className="label strop text-towel/70 hover:text-towel">
					Profile
				</Link>
				<Link href={bookHref({ barber: barber.slug, service: signature?.slug })} className="label strop text-brass-hi">
					Book {barber.firstName} →
				</Link>
			</div>
		</Swivel>
	);
}
