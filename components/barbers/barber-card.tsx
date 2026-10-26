import Link from 'next/link';
import type { Barber } from '@/lib/catalog';

/** A barber as a tall portrait with a thin paper inset frame, name and craft line. */
export function BarberCard({ barber, shopNames }: { barber: Barber; shopNames?: string }) {
	return (
		<Link href={`/barbers/${barber.slug}`} className="photo-zoom group block">
			<div className="relative aspect-[4/5] overflow-hidden bg-green-2">
				{barber.imageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={barber.imageUrl} alt={`${barber.name}, ${barber.title}`} loading="lazy" className="h-full w-full object-cover" />
				) : null}
				<span aria-hidden className="pointer-events-none absolute inset-2 border border-paper/35" />
			</div>
			<p className="serif mt-3 text-[1.2rem] leading-tight group-hover:text-green">{barber.name}</p>
			<p className="text-sm text-ink-2">{barber.title}</p>
			{barber.known.length || shopNames ? <p className="mt-1 text-xs text-ink-3">{[barber.known.slice(0, 2).join(', '), shopNames].filter(Boolean).join(' · ')}</p> : null}
		</Link>
	);
}
