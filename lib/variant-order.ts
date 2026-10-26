/**
 * Display order for the options of one treatment. The API returns variants in
 * the order they were created, which can read "Ages 3–6, 13–17, 7–12" or put a
 * dearer option first. Options that start with a number (age bands, surfaces)
 * sort numerically; everything else by price, then length.
 */
export interface OrderableOption {
	label: string | null | undefined;
	price: number;
	duration: number;
}

const leadingNumber = (label: string | null | undefined): number | null => {
	const m = label?.match(/\d+/);
	return m ? Number(m[0]) : null;
};

export function compareOptions(a: OrderableOption, b: OrderableOption): number {
	const na = leadingNumber(a.label);
	const nb = leadingNumber(b.label);
	if (na !== null && nb !== null && na !== nb) return na - nb;
	return a.price - b.price || a.duration - b.duration;
}
