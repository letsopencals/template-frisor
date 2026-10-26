import clsx from 'clsx';

/**
 * The station mirror: a round portrait in a turned brass ring. Falls back to the barber's
 * initials engraved on dark glass when the store has no photo.
 */
export function Mirror({ src, name, size = 160, className, priority }: { src: string | null; name: string; size?: number; className?: string; priority?: boolean }) {
	const initials = name
		.split(' ')
		.map((p) => p[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('');
	return (
		<div className={clsx('mirror shrink-0', className)} style={{ width: size, maxWidth: '100%', aspectRatio: '1 / 1' }}>
			<div className="relative h-full w-full bg-lacquer-2">
				{src ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={src} alt={name} className="h-full w-full object-cover" loading={priority ? 'eager' : 'lazy'} />
				) : (
					<span className="serif flex h-full w-full items-center justify-center text-brass-hi" style={{ fontSize: size * 0.32 }} aria-label={name}>
						{initials}
					</span>
				)}
			</div>
		</div>
	);
}
