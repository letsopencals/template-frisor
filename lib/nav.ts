/** The Counter bar's links, in board order. */
export const NAV = [
	{ href: '/menu', label: 'Menu', board: 'The menu' },
	{ href: '/barbers', label: 'Barbers', board: 'The barbers' },
	{ href: '/shops', label: 'Shops', board: 'The shops' },
	{ href: '/apothecary', label: 'The Shelf', board: 'The shelf' },
	{ href: '/account', label: 'Account', board: 'Your card' },
] as const;

/** What each board row says on the right ("from €18", "13 chairs"…), filled in by the layout. */
export type BoardFacts = Partial<Record<(typeof NAV)[number]['href'], string>>;
