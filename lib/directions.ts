/** Google Maps directions to a shop, by coordinates when known, else by address. */
export function directionsHref(shop: { title: string; addressLines: string[]; latitude?: number | null; longitude?: number | null; lat?: number | null; lng?: number | null }): string {
	const lat = shop.latitude ?? shop.lat ?? null;
	const lng = shop.longitude ?? shop.lng ?? null;
	const destination = lat !== null && lng !== null ? `${lat},${lng}` : [shop.title, ...shop.addressLines].join(', ');
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
