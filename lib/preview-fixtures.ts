import type { Catalog } from '@/lib/catalog-server';
import type { Sitting } from '@/lib/sittings';

/**
 * Fixture sittings for /preview/[screen], built from the real catalogue (services, barbers,
 * shops, shelf) so screenshots show the store's own names, prices and photos. No customer data.
 */
const DAY = 86_400_000;

function at(daysFromNow: number, hour: number, minute = 0): number {
	const d = new Date(Date.now() + daysFromNow * DAY);
	if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + (daysFromNow < 0 ? -1 : 1)); // shops are closed on Sundays
	d.setUTCHours(hour - 1, minute, 0, 0); // Berlin (CET) wall time, close enough for fixtures
	return d.getTime();
}

export function fixtureSittings(c: Catalog): Sitting[] {
	const pick = (slug: string) => c.services.find((s) => s.slug === slug) ?? c.services[0]!;
	const make = (i: number, slug: string, barberIdx: number, shopIdx: number, start: number, status: Sitting['status'], shelfSlugs: string[] = []): Sitting => {
		const svc = pick(slug);
		const shop = c.shops[shopIdx % c.shops.length]!;
		const here = c.barbers.filter((b) => shop.barberIds.includes(b.id));
		const b = here[barberIdx % Math.max(1, here.length)] ?? c.barbers[0]!;
		const lines = shelfSlugs
			.map((s) => c.shelf.find((x) => x.slug === s))
			.filter((x) => !!x)
			.map((x) => ({ id: `fx-line-${i}-${x!.slug}`, slug: x!.slug, title: x!.title, quantity: 1, unitPrice: x!.price, image: x!.image, shelf: true }));
		return {
			id: `fx-sitting-${i}`,
			status,
			from: new Date(start).toISOString(),
			to: new Date(start + svc.duration * 1000).toISOString(),
			service: { id: svc.id, slug: svc.slug, title: svc.groupTitle, option: svc.option, duration: svc.duration, price: svc.price, image: svc.image, allowCustomerCancel: true, allowCustomerReschedule: true, cancelGap: 4 * 3600, rescheduleGap: 4 * 3600 },
			barber: { id: b.id, slug: b.slug, name: b.name, firstName: b.firstName, imageUrl: b.imageUrl },
			shop: { id: shop.id, slug: shop.slug, title: shop.title, addressLines: shop.addressLines, latitude: shop.lat, longitude: shop.lng },
			notes: [],
			lines,
			charge: null,
		};
	};
	return [
		make(1, 'classic-cut-fade', 0, 0, at(6, 14, 30), 'scheduled', ['shelf-matte-clay']),
		make(2, 'beard-trim-shape', 1, 0, at(27, 18), 'scheduled'),
		make(3, 'classic-cut-fade', 0, 0, at(-22, 11, 15), 'completed', ['shelf-matte-clay', 'shelf-juniper-shampoo']),
		make(4, 'hot-towel-shave-classic', 2, 1, at(-49, 17, 45), 'completed', ['shelf-aftershave']),
		make(5, 'classic-cut-standard', 1, 2, at(-80, 10), 'canceled'),
	];
}
