import { money, type ShelfItem } from '@/lib/catalog';
import { AddToDocket } from '@/components/shelf/add-to-docket';

/** One shelf product as a small card with its swing tag and the docket action. */
export function ShelfPick({ item, currency, note }: { item: ShelfItem; currency: string; note?: string }) {
	return (
		<li data-shelf-card className="flex flex-col">
			<div className="relative aspect-square overflow-hidden bg-lacquer-2">
				{item.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
				) : null}
			</div>
			<div className="plank" aria-hidden />
			<div className="swing-tag paper mt-4 py-2 pr-3">
				<span className="serif block leading-tight">{item.title}</span>
				<span className="tabular mt-0.5 block text-sm text-walnut">{money(item.price, currency)}</span>
			</div>
			<p className="mt-3 flex-1 text-sm leading-relaxed text-towel/75">{note ?? item.note?.use ?? item.description}</p>
			<div className="mt-4">
				<AddToDocket item={{ id: item.id, slug: item.slug, serviceIds: item.serviceIds }} image={item.image} />
			</div>
		</li>
	);
}
