'use client';

import { useRef, useState } from 'react';
import { bookHref } from '@/lib/catalog';
import { flyToKit } from '@/lib/fly-to-kit';
import { useShelfDocket, type ShelfTarget } from '@/hooks/use-shelf-docket';
import { TagButton, TagLink } from '@/components/ui/tag';

/**
 * The shelf's one action. With a sitting already held on the docket it adds the product to it
 * (and flies it into the tab); without one it starts a booking with the product in the kit.
 */
export function AddToDocket({ item, image, size = 'sm', full }: { item: ShelfTarget; image: string | null; size?: 'sm' | 'md'; full?: boolean }) {
	const { targetFor, add, busy, quantityOf } = useShelfDocket();
	const ref = useRef<HTMLButtonElement>(null);
	const [done, setDone] = useState(false);
	const target = targetFor(item);
	const qty = quantityOf(item.id);

	if (!target) {
		return (
			<TagLink href={bookHref({ kit: item.slug })} size={size} variant="line" full={full}>
				Book &amp; add
			</TagLink>
		);
	}
	return (
		<TagButton
			ref={ref}
			size={size}
			full={full}
			disabled={busy === item.id}
			onClick={async () => {
				const img = ref.current?.closest('[data-shelf-card]')?.querySelector('img') ?? ref.current;
				if (await add(item)) {
					flyToKit(img, image);
					setDone(true);
				}
			}}
		>
			{busy === item.id ? 'Adding…' : done || qty > 0 ? `On the docket · ${qty}` : 'Add to the docket'}
		</TagButton>
	);
}
