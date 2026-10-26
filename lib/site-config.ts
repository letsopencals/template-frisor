/**
 * Site configuration: copy, presentation and the editorial layer on top of the store.
 *
 * Everything bookable or sellable (services, prices, durations, barbers, shops, shelf products)
 * comes from the Opencals store. This file only adds what the API doesn't carry: photography,
 * barber bios, shop notes, barbers' picks, care notes and how often a cut should be redone.
 * Keys are slugs; a slug the store doesn't have is simply ignored, and anything the store adds
 * still renders from the API alone.
 */

export interface ShopMeta {
	/** "Mitte" (the title without the brand). */
	short: string;
	area: string;
	/** One line under the name. */
	tagline: string;
	note: string;
	transit: string;
	chairs: number;
	since: string;
	image: string;
	image2: string;
}

export interface BarberProfile {
	/** "Master barber", "Shave specialist"… */
	title: string;
	bio: string;
	years: number;
	/** Short craft tags shown on the mirror plate. */
	known: string[];
	/** Variant slug of the barber's signature service. */
	signature?: string;
	/** Shelf slugs the barber reaches for (shown as "What Theo uses"). */
	uses: string[];
	quote?: string;
}

export interface ShelfNote {
	/** How to use it, in one sentence. */
	use: string;
	/** "Hold: strong · Shine: none" style facts. */
	facts?: string[];
	/** Shelf row on the apothecary wall. */
	row: 'hair' | 'beard' | 'shave' | 'kit';
}

export const siteConfig = {
	name: 'Frisør',
	shortName: 'Frisør',
	legalName: 'Frisør Barbers Berlin',
	tagline: 'Barbers & apothecary, Berlin',
	description:
		'Three barbershops in Berlin: skin fades, scissor cuts, hot-towel shaves and grey blending, booked to the minute. Pick up your pomade at the chair.',
	url: 'https://template-frisor.vercel.app',
	locale: 'en-DE',
	currency: 'EUR',
	timeZone: 'Europe/Berlin',
	established: 2013,

	contact: {
		email: 'hello@frisor.shop',
		phone: '+49 30 555 0142',
		hours: 'Mon–Fri 10:00–20:00 · Sat 09:00–19:00 · Sun closed',
		instagram: 'https://instagram.com/',
	},

	/** Hours per weekday (1 = Monday … 7 = Sunday), shown on shop pages and the "open now" chip. */
	hours: {
		1: ['10:00', '20:00'],
		2: ['10:00', '20:00'],
		3: ['10:00', '20:00'],
		4: ['10:00', '20:00'],
		5: ['10:00', '20:00'],
		6: ['09:00', '19:00'],
		7: null,
	} as Record<number, [string, string] | null>,

	hero: {
		image: '/images/hero/hero-portrait.jpg',
		kicker: 'Barbers & apothecary · Since 2013',
		lines: ['Sharp cuts,', 'slow shaves.'],
		body: 'Thirteen barbers across Mitte, Kreuzberg and Prenzlauer Berg. Book the chair, the barber and the minute, and have your pomade waiting when you sit down.',
	},

	/** Section signs, numbered by clipper guard (see DESIGN.md). */
	guards: ['0', '½', '1', '1½', '2', '3', '4', '6', '8'],

	/** Menu sections: collection slug → sign + line. Collections the store adds render with their own title. */
	menu: {
		'everyday-cuts': { sign: 'The Everyday', line: 'Clean, quick and consistent. Most of the book.' },
		'the-ritual': { sign: 'The Ritual', line: 'Hot towels, straight razors and time. Lie back.' },
		'grey-and-colour': { sign: 'Grey & Colour', line: 'Softened, not hidden. Fades out with no line.' },
		family: { sign: 'Family', line: 'A first proper haircut, in the big chair.' },
	} as Record<string, { sign: string; line: string }>,

	/** Per variant slug: how many days a result holds (the account's "next due" and the thank-you "see you around…"). */
	cadenceDays: {
		'classic-cut-standard': 28,
		'classic-cut-fade': 21,
		'classic-cut-scissor': 35,
		'beard-trim-shape': 14,
		'beard-trim-design': 21,
		'hot-towel-shave-classic': 14,
		'hot-towel-shave-deluxe': 21,
		'cut-and-beard': 21,
		'cut-and-beard-full-ritual': 28,
		'grey-blend-hair': 35,
		'grey-blend-hair-beard': 35,
		'head-shave': 10,
		'kids-cut': 35,
	} as Record<string, number>,

	/** Per variant slug: before-you-sit notes on the chair check. */
	beforeYouSit: {
		default: ['Come with dry, unstyled hair if you can.', 'Bring a photo if you have a cut in mind.', 'Running late? Call the shop; we hold the chair 10 minutes.'],
		'hot-towel-shave-classic': ['Skip your own shave for two days.', 'Tell us about sensitive skin before the first pass.'],
		'hot-towel-shave-deluxe': ['Skip your own shave for two days.', 'Allow an hour; the mask needs its ten minutes.'],
		'head-shave': ['Skip your own shave for two days.', 'Bring a cap if it’s cold out.'],
		'grey-blend-hair': ['No colour or henna in the last four weeks.', 'Come with clean, dry hair.'],
		'grey-blend-hair-beard': ['No colour or henna in the last four weeks.', 'Come with clean, dry hair and beard.'],
		'kids-cut': ['A snack before helps. So does a favourite cartoon on your phone.'],
	} as Record<string, string[]>,

	shops: {
		'frisor-mitte': {
			short: 'Mitte',
			area: 'Torstraße',
			tagline: 'The first shop. Five chairs and the long shelf.',
			note: 'Ring the brass bell if the door’s shut. Coffee from the place next door is on us.',
			transit: 'U8 Rosenthaler Platz · 3 min walk',
			chairs: 5,
			since: '2013',
			image: '/images/locations/location-1.jpg',
			image2: '/images/about/about-shop.jpg',
		},
		'frisor-kreuzberg': {
			short: 'Kreuzberg',
			area: 'Bergmannkiez',
			tagline: 'Brick, tiles and the loudest record player in the chain.',
			note: 'Step-free from the street. Bikes go in the courtyard.',
			transit: 'U7 Gneisenaustraße · 6 min walk',
			chairs: 4,
			since: '2017',
			image: '/images/locations/location-2.jpg',
			image2: '/images/gallery/look-3.jpg',
		},
		'frisor-prenzlauer-berg': {
			short: 'Prenzlauer Berg',
			area: 'Kastanienallee',
			tagline: 'High ceilings, three brass arches and a kids’ booster seat.',
			note: 'Saturday mornings are busy with families; evenings are quiet.',
			transit: 'U2 Eberswalder Straße · 4 min walk',
			chairs: 4,
			since: '2020',
			image: '/images/locations/location-3.jpg',
			image2: '/images/gallery/look-5.jpg',
		},
	} as Record<string, ShopMeta>,

	barbers: {
		'theo-marchetti': {
			title: 'Head barber, Mitte',
			bio: 'Theo opened Frisør with a borrowed chair in 2013. He still cuts five days a week and still teaches every new barber the same skin fade.',
			years: 16,
			known: ['Skin fades', 'Straight razor', 'Teaching'],
			signature: 'classic-cut-fade',
			uses: ['shelf-matte-clay', 'shelf-aftershave', 'shelf-horn-comb'],
			quote: 'A fade is only as good as the blend at the guard No. 1.',
		},
		'ramon-diaz': {
			title: 'Senior barber',
			bio: 'Trained in Valencia, cuts by eye. Ramon’s scissor work is the reason half of Mitte grows its hair out.',
			years: 12,
			known: ['Scissor cuts', 'Curls', 'Long on top'],
			signature: 'classic-cut-scissor',
			uses: ['shelf-sea-salt-tonic', 'shelf-juniper-shampoo'],
		},
		'ethan-walker': {
			title: 'Shave specialist',
			bio: 'Ethan came from a Savile Row barber and brought the hot-towel ritual with him: two towels, a brushed lather, two passes.',
			years: 10,
			known: ['Hot-towel shave', 'Beard design'],
			signature: 'hot-towel-shave-deluxe',
			uses: ['shelf-shave-cream', 'shelf-safety-razor', 'shelf-aftershave'],
		},
		'kai-nakamura': {
			title: 'Barber',
			bio: 'Kai does the sharpest textured crops in the shop and the most patient kids’ cuts.',
			years: 6,
			known: ['Textured crops', 'Kids'],
			signature: 'classic-cut-standard',
			uses: ['shelf-matte-clay', 'shelf-sea-salt-tonic'],
		},
		'andre-costa': {
			title: 'Shave specialist',
			bio: 'André shapes beards like topiary. Book him for a new beard line or a head shave.',
			years: 9,
			known: ['Beard sculpt', 'Head shave'],
			signature: 'beard-trim-design',
			uses: ['shelf-beard-oil', 'shelf-beard-balm'],
		},
		'dominic-pierce': {
			title: 'Head barber, Kreuzberg',
			bio: 'Dominic runs Kreuzberg and the record player. Classic tapers, side parts and slick-backs.',
			years: 14,
			known: ['Tapers', 'Side parts', 'Pomade work'],
			signature: 'cut-and-beard',
			uses: ['shelf-water-pomade', 'shelf-horn-comb'],
		},
		'rafael-santos': {
			title: 'Shave specialist',
			bio: 'Rafael’s Full Ritual is ninety minutes most people book again before they leave.',
			years: 11,
			known: ['Full Ritual', 'Hot-towel shave'],
			signature: 'cut-and-beard-full-ritual',
			uses: ['shelf-shave-cream', 'shelf-beard-oil'],
		},
		'lars-holm': {
			title: 'Barber',
			bio: 'Copenhagen-trained. Lars does the Scandinavian short back and sides the shop is named for.',
			years: 8,
			known: ['Short back & sides', 'Grey blend'],
			signature: 'grey-blend-hair',
			uses: ['shelf-juniper-shampoo', 'shelf-matte-clay'],
		},
		'mikkel-sorensen': {
			title: 'Shave specialist',
			bio: 'Mikkel is the calmest pair of hands in Berlin with a straight razor.',
			years: 7,
			known: ['Head shave', 'Hot-towel shave'],
			signature: 'head-shave',
			uses: ['shelf-safety-razor', 'shelf-aftershave'],
		},
		'jonas-becker': {
			title: 'Head barber, Prenzlauer Berg',
			bio: 'Jonas runs the arches on Kastanienallee and books out Saturday mornings with families.',
			years: 13,
			known: ['Kids', 'Classic cuts'],
			signature: 'kids-cut',
			uses: ['shelf-water-pomade', 'shelf-horn-comb'],
		},
		'finn-bauer': {
			title: 'Barber',
			bio: 'Finn’s fades are tight and fast. Lunchtime regulars swear by him.',
			years: 5,
			known: ['Skin fades', 'Quick cuts'],
			signature: 'classic-cut-fade',
			uses: ['shelf-matte-clay'],
		},
		'oskar-lindqvist': {
			title: 'Barber',
			bio: 'Oskar specialises in grey: blending it in, softening it, and telling you it looks good. It does.',
			years: 9,
			known: ['Grey blend', 'Beards'],
			signature: 'grey-blend-hair-beard',
			uses: ['shelf-beard-balm', 'shelf-juniper-shampoo'],
		},
		'mateo-ferrari': {
			title: 'Barber',
			bio: 'Mateo brings Milanese polish: soft tapers, pompadours and a lot of comb work.',
			years: 7,
			known: ['Pompadours', 'Tapers'],
			signature: 'cut-and-beard',
			uses: ['shelf-water-pomade', 'shelf-horn-comb'],
		},
	} as Record<string, BarberProfile>,

	/** The Shelf. Products themselves (name, price, photo) come from the store's `shelf-*` add-ons. */
	shelf: {
		prefix: 'shelf-',
		/** Applied automatically once the first shelf product is in the cart. Leave empty to turn off. */
		autoCode: 'SHELF15',
		autoCodeLabel: '15% off the shelf with any sitting',
		notes: {
			'shelf-matte-clay': { row: 'hair', use: 'A fingertip, warmed in the palms, worked through dry hair from the back.', facts: ['Hold: strong', 'Shine: none'] },
			'shelf-water-pomade': { row: 'hair', use: 'Comb it through damp hair for a part that lasts the day.', facts: ['Hold: medium', 'Shine: high'] },
			'shelf-sea-salt-tonic': { row: 'hair', use: 'Four sprays into damp hair, then dry with your fingers.', facts: ['Hold: light', 'Finish: matte'] },
			'shelf-juniper-shampoo': { row: 'hair', use: 'A small amount, every day if you like. Rinse cool.', facts: ['Sulfate-free'] },
			'shelf-beard-oil': { row: 'beard', use: 'Four drops after a shower, into the skin, then down the beard.', facts: ['Cedar & vetiver'] },
			'shelf-beard-balm': { row: 'beard', use: 'A pea-sized amount, brushed in the direction of growth.', facts: ['Hold: light'] },
			'shelf-shave-cream': { row: 'shave', use: 'Whip with a wet brush for thirty seconds before every pass.', facts: ['Bay rum'] },
			'shelf-aftershave': { row: 'shave', use: 'Splash into the palms and press onto the skin. It stings for a second.', facts: ['Tobacco & birch'] },
			'shelf-safety-razor': { row: 'shave', use: 'Thirty degrees, no pressure, with the grain first.', facts: ['Solid brass', '10 blades'] },
			'shelf-horn-comb': { row: 'kit', use: 'Fine teeth for the part, wide teeth for the pomade.', facts: ['Hand-cut acetate'] },
			'shelf-travel-kit': { row: 'kit', use: 'Everything for a long weekend, cleared for hand luggage.', facts: ['4 pieces'] },
			'shelf-gift-card': { row: 'kit', use: 'Handed over with your receipt, in a sealed envelope.', facts: ['Any service or the shelf'] },
		} as Record<string, ShelfNote>,
		/** What to suggest beside a service (variant slug → shelf slugs, best first). */
		pairs: {
			'classic-cut-standard': ['shelf-matte-clay', 'shelf-water-pomade', 'shelf-horn-comb'],
			'classic-cut-fade': ['shelf-matte-clay', 'shelf-sea-salt-tonic', 'shelf-juniper-shampoo'],
			'classic-cut-scissor': ['shelf-sea-salt-tonic', 'shelf-juniper-shampoo', 'shelf-horn-comb'],
			'beard-trim-shape': ['shelf-beard-oil', 'shelf-beard-balm'],
			'beard-trim-design': ['shelf-beard-oil', 'shelf-beard-balm', 'shelf-horn-comb'],
			'hot-towel-shave-classic': ['shelf-shave-cream', 'shelf-aftershave', 'shelf-safety-razor'],
			'hot-towel-shave-deluxe': ['shelf-safety-razor', 'shelf-shave-cream', 'shelf-aftershave'],
			'cut-and-beard': ['shelf-beard-oil', 'shelf-matte-clay', 'shelf-travel-kit'],
			'cut-and-beard-full-ritual': ['shelf-travel-kit', 'shelf-beard-oil', 'shelf-aftershave'],
			'grey-blend-hair': ['shelf-juniper-shampoo', 'shelf-water-pomade'],
			'grey-blend-hair-beard': ['shelf-juniper-shampoo', 'shelf-beard-oil'],
			'head-shave': ['shelf-safety-razor', 'shelf-aftershave', 'shelf-shave-cream'],
			'kids-cut': ['shelf-horn-comb', 'shelf-juniper-shampoo'],
		} as Record<string, string[]>,
		rows: [
			{ key: 'hair', sign: 'Hair' },
			{ key: 'beard', sign: 'Beard' },
			{ key: 'shave', sign: 'Shave' },
			{ key: 'kit', sign: 'Kit & gifts' },
		] as const,
		wall: '/images/shop/apothecary-wall.jpg',
		till: '/images/shop/till-counter.jpg',
	},

	house: {
		image: '/images/about/about-shop.jpg',
		detail: '/images/about/about-detail.jpg',
		steam: '/images/shop/steam-towel.jpg',
		story: [
			'Frisør is Danish for barber. Theo Marchetti learned the trade in Copenhagen and opened the first shop on Torstraße in 2013 with one chair, a borrowed mirror and a shelf of products he made up in the back.',
			'Twelve years later there are three shops and thirteen barbers, and the rules haven’t changed: every cut is booked to the minute, nobody is rushed, and the towels are always hot.',
			'The shelf grew with us. Everything on it is something we use at the chair, and anything you buy with a booking is waiting at your station when you sit down.',
		],
		principles: [
			{ guard: '0', title: 'To the minute', body: 'Your time is held. If we run late, the next service is on the house.' },
			{ guard: '1', title: 'One barber, start to finish', body: 'No hand-offs at the basin. The person who cuts is the person who finishes.' },
			{ guard: '2', title: 'Hot towels, every time', body: 'Every service closes with a hot towel. You don’t have to ask.' },
			{ guard: '3', title: 'The shelf is what we use', body: 'If it isn’t good enough for the chair, it isn’t on the shelf.' },
		],
	},

	gallery: [
		'/images/gallery/look-1.jpg',
		'/images/gallery/look-2.jpg',
		'/images/gallery/look-4.jpg',
		'/images/gallery/look-6.jpg',
	],

	/** Shown on the thank-you page while there is no order to read (preview) and in the footer. */
	policy: {
		cancel: 'Cancel or move your sitting up to 4 hours before, free, from your account.',
		late: 'We hold the chair for 10 minutes.',
		pickup: 'Shelf products are packed and waiting at your station. Not right? Swap them at the till.',
	},
};

export type SiteConfig = typeof siteConfig;

export function shopMeta(slug: string, index = 0): ShopMeta {
	const meta = siteConfig.shops[slug];
	if (meta) return meta;
	const fallbacks = Object.values(siteConfig.shops);
	const f = fallbacks[index % fallbacks.length]!;
	return { ...f, short: slug, area: '', tagline: '', note: '', transit: '' };
}
