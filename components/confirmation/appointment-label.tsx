import clsx from 'clsx';

/** A stable 4-digit "lot number" from an appointment id. */
export function lotNumber(id: string): string {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
	return String(1000 + (h % 9000));
}

/**
 * The signature artifact (DESIGN.md "Thank-you"): a printed apothecary label with a double
 * rule, an oval cartouche holding the time, and the lot line. Decorative; the same facts are
 * listed plainly beside it.
 */
export function AppointmentLabel({ id, day, time, service, barber, shop, size = 'lg' }: { id: string; day: string; time: string; service: string; barber: string | null; shop: string; size?: 'lg' | 'sm' }) {
	const lg = size === 'lg';
	return (
		<figure aria-hidden className={clsx('relative bg-[#fbf8f2] text-ink shadow-[0_30px_60px_-30px_rgba(23,32,28,0.45)]', lg ? 'w-full max-w-[400px] p-3' : 'w-[260px] p-2')}>
			<div className="border border-ink/70 p-[3px]">
				<div className={clsx('flex flex-col items-center border border-ink/70 text-center', lg ? 'px-6 pb-7 pt-6' : 'px-4 pb-5 pt-4')}>
					<p className={clsx('display tracking-[0.18em]', lg ? 'text-2xl' : 'text-lg')}>FRISØR</p>
					{lg ? <p className="label mt-1 text-[0.5rem] tracking-[0.3em] text-brass-lo">Barbers &amp; Apothecary · Berlin</p> : null}
					<div className={clsx('cartouche mt-5 flex flex-col items-center justify-center text-green', lg ? 'h-[150px] w-[230px]' : 'h-[104px] w-[164px]')}>
						<span className="label text-[0.6rem] text-ink-2">{day}</span>
						<span className={clsx('serif tabular leading-none text-ink', lg ? 'mt-1 text-[3.6rem]' : 'mt-0.5 text-[2.4rem]')}>{time}</span>
					</div>
					<p className={clsx('serif mt-5 leading-snug', lg ? 'text-xl' : 'text-base')}>{service}</p>
					<div className="mt-3 h-[5px] w-24 border-y border-ink/40" />
					<p className="label mt-3 text-[0.56rem] text-ink-2">
						No. {lotNumber(id)} · {barber ? `With ${barber}` : 'First free barber'} · {shop}
					</p>
				</div>
			</div>
		</figure>
	);
}
