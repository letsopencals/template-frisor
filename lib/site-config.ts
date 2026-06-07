/**
 * Site configuration — edit this file to customize all branding and copy.
 *
 * Every hardcoded shop name, tagline, contact detail, and homepage copy
 * is sourced from here so you can rebrand the entire template in one place.
 */

export const siteConfig = {
	name: 'Frisor',
	tagline: 'The Modern Barbershop',
	description:
		'A modern barbershop for the well-groomed. Classic cuts, hot-towel shaves, beard work — booked in seconds.',
	url: 'https://example.com',

	/** Logo rendered as: {text}{accent} */
	logo: { text: 'Frisor', accent: '.' },

	/** Hero section on the homepage */
	hero: {
		subtitle: 'The Modern Barbershop',
		heading: ['THE', "GENTLEMAN'S"],
		headingAccent: 'Club',
		body: 'Precision cuts, hot-towel shaves, and beard work — by appointment or walk-in. A modern barbershop with old-soul standards.',
		cta: { label: 'Book Appointment', href: '/services' },
		secondaryCta: { label: 'Our Services', href: '/services' },
		stat: { value: '12+', label: 'Years\nIn Business' },
		backgroundText: 'FRISOR',
	},

	/** CTA section on the homepage (kept for compatibility — Frisor uses stats-band instead) */
	cta: {
		subtitle: 'Sharp Cuts. Honest Prices.',
		heading: ['STYLE', 'YOU CAN'],
		headingAccent: 'Trust',
		body: "Every visit to Frisor is more than a haircut — it's a thirty-minute reset. Skilled barbers, sharp tools, no chairs left unattended.",
		stats: [
			{ value: '78k+', label: 'Happy Clients' },
			{ value: '10', label: 'Master Barbers' },
			{ value: '80k+', label: 'Cuts Delivered' },
		],
	},

	/** Services section on the homepage */
	services: [
		{
			title: 'Classic Cut',
			description: 'Skin-fade or scissor cut tailored to your head shape and lifestyle. Includes a hot-towel finish.',
			href: '/booking/classic-cut-fade',
			price: '$45',
			duration: '45 min',
		},
		{
			title: 'Beard Trim',
			description: 'Sharp lines, balanced shape, and conditioning oil. A proper finish for a proper beard.',
			href: '/booking/beard-trim-design',
			price: '$25',
			duration: '20 min',
		},
		{
			title: 'Hot Towel Shave',
			description: 'A traditional straight-razor shave with hot towels, pre-shave oil, and a cool-down finish.',
			href: '/booking/hot-towel-shave-deluxe',
			price: '$55',
			duration: '40 min',
		},
		{
			title: 'Cut + Beard',
			description: 'The full reset. Classic cut and beard trim, finished with hot towel and styling product.',
			href: '/booking/cut-and-beard',
			price: '$65',
			duration: '60 min',
		},
		{
			title: 'Kids Cut',
			description: 'Patient, friendly haircuts for under-12s. Easy in, easy out, always a clean finish.',
			href: '/booking/kids-cut',
			price: '$30',
			duration: '30 min',
		},
	],

	/** Stats band on the homepage */
	statsBand: {
		stats: [
			{ value: '10', label: 'Master Barbers' },
			{ value: '80k+', label: 'Cuts Delivered' },
			{ value: '78k+', label: 'Happy Clients' },
		],
	},

	/** Story strip cards (homepage, replaces marquee + stats-band) */
	storyStrip: {
		eyebrow: 'The Shop',
		cards: [
			{
				numeral: '01',
				heading: 'Founded 2013',
				body: 'A single chair in Berlin-Mitte, a sharp pair of scissors, and a quieter way to get a haircut.',
			},
			{
				numeral: '02',
				heading: 'Four Shops',
				body: 'Berlin · Munich · Hamburg. Same chairs. Same standard. Same barbers behind every one of them.',
			},
			{
				numeral: '03',
				heading: 'Eighty Thousand',
				body: "Cuts delivered since we opened. Every one finished with a hot towel and walked out by hand.",
			},
			{
				numeral: '04',
				heading: 'Booked in 60s',
				body: 'No phone calls, no waiting room. Pick a chair on your phone, walk in fresh on your day.',
			},
		],
	},

	/** Process strip — numbered steps how booking works */
	process: {
		eyebrow: 'How It Works',
		steps: [
			{ number: '01', title: 'Choose your cut', body: 'Five services, one clear price each.' },
			{ number: '02', title: 'Pick your barber', body: 'Or leave it to us — every chair is sharp.' },
			{ number: '03', title: 'Pick a time', body: 'See real availability across all four shops.' },
			{ number: '04', title: 'Walk in fresh', body: 'No paperwork, no waiting. Sit down, get cut.' },
		],
	},

	/** Lookbook (gallery replacement) — captioned editorial frames */
	lookbook: {
		eyebrow: 'Recent Work',
		heading: 'The Lookbook',
		body: 'A small selection of the cuts that walked out of our chairs this month.',
		frames: [
			{ image: 'gallery/look-1.jpg', caption: 'Classic Fade · Dominic P.', size: 'tall' as const },
			{ image: 'gallery/look-2.jpg', caption: 'Hot Towel Shave · Rafael S.', size: 'square' as const },
			{ image: 'gallery/look-3.jpg', caption: 'Textured Crop · Theo M.', size: 'wide' as const },
			{ image: 'gallery/look-4.jpg', caption: 'Beard Sculpt · Ramon D.', size: 'square' as const },
			{ image: 'gallery/look-5.jpg', caption: 'Razor Line · Kai N.', size: 'tall' as const },
			{ image: 'gallery/look-6.jpg', caption: 'Cut & Beard · Ethan W.', size: 'wide' as const },
		],
	},

	/** Locations strip on the homepage — paired positionally with API locations[0..2] */
	locations: {
		eyebrow: 'The Shops',
		heading: 'Three chairs.\nOne standard.',
		body: 'Pick a chair near you and book in seconds. Same barbers, same craft, same standard at every door.',
		cards: [
			{ image: 'locations/location-1.jpg', tagline: 'The Flagship', hoursHint: 'Mon–Sat · 9–8' },
			{ image: 'locations/location-2.jpg', tagline: 'The Corner Shop', hoursHint: 'Mon–Sat · 10–7' },
			{ image: 'locations/location-3.jpg', tagline: 'The Loft', hoursHint: 'Tue–Sun · 10–8' },
		],
	},

	/** Booking banner on the homepage */
	bookingBanner: {
		heading: ['READY FOR YOUR'],
		headingAccent: 'Next Cut?',
		body: 'Book your chair today. Same-week appointments at every location.',
		cta: { label: 'Book Now', href: '/services' },
	},

	/** About page */
	about: {
		heroSubtitle: 'About Frisor',
		heroHeading: ['CLASSIC CRAFT,', 'MODERN'],
		heroHeadingAccent: 'Shop',
		heroBody:
			"A barbershop built around the chair, not the cash register. We invest in our barbers, our tools, and the time it takes to do it right.",
		storyParagraphs: [
			'Frisor opened in 2013 with a simple idea: a barbershop where the cut comes first. No rushed thirty-minute slots, no upsells, no surprises at the till. Just a clean chair, a sharp blade, and a barber who knows what they’re doing.',
			'What started as a single chair in a small storefront has grown into a small network of shops across the city — but the formula hasn’t changed. Same barbers. Same prices. Same standard.',
			'Today, ten master barbers work under the Frisor name. Between us, we’ve delivered more than 80,000 cuts. Each one finished with a hot towel and walked out by hand.',
		],
		bottomCta: 'COME SEE FOR YOURSELF',
		bottomCtaBody:
			'Book your first appointment and find out why our regulars don’t go anywhere else.',
	},

	/** Footer */
	footer: {
		description:
			"A modern barbershop for the well-groomed. Skilled barbers, sharp tools, and the time to do it right.",
		socials: ['Instagram', 'Facebook', 'TikTok'],
		serviceLinks: [
			{ label: 'Classic Cut', href: '/booking/classic-cut-fade' },
			{ label: 'Beard Trim', href: '/booking/beard-trim-design' },
			{ label: 'Hot Towel Shave', href: '/booking/hot-towel-shave-deluxe' },
			{ label: 'Cut + Beard', href: '/booking/cut-and-beard' },
			{ label: 'Kids Cut', href: '/booking/kids-cut' },
		],
		companyLinks: [
			{ label: 'About', href: '/about' },
			{ label: 'Our Barbers', href: '/about#team' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Book Appointment', href: '/services' },
		],
	},

	/** Contact page */
	contact: {
		address: '218 Mulberry Street\nNew York, NY 10012',
		phone: '+1 (212) 555-0114',
		email: 'hello@frisor.shop',
		hours:
			'Mon — Fri: 9:00 AM — 8:00 PM\nSat: 9:00 AM — 7:00 PM\nSun: 10:00 AM — 5:00 PM',
	},

	/** Testimonials (homepage) */
	testimonials: [
		{
			quote:
				"Best fade I've had in years. Booked it from my phone in about thirty seconds. Walked in, walked out, looked sharp.",
			author: 'Marcus Hale',
			role: 'Regular',
		},
		{
			quote:
				"The hot-towel shave is something else. You don't appreciate how rare a proper straight razor is until you sit in one of their chairs.",
			author: 'Daniel Okafor',
			role: 'Hot Towel Shave',
		},
		{
			quote:
				"My barber actually listens. I've been chasing the same haircut for a decade — Frisor nailed it on the first visit.",
			author: 'Jamie Park',
			role: 'Cut + Beard',
		},
		{
			quote:
				"Brought my son in for his first cut. Patient, kind, fast — and clean fade to match mine. Family barbershop done right.",
			author: 'Theo Reyes',
			role: 'Kids Cut',
		},
	],

	/** Team members shown on About page and Barbers showcase */
	team: [
		{
			name: 'Theo Marchetti',
			role: 'Founder & Master Barber',
			specialty: 'Textured scissor work',
			bio: 'Twenty years behind the chair. Trained in London and Brooklyn. Known for textured scissor cuts and a heavy hand with the talc.',
			image: 'team/theo-marchetti.jpg',
		},
		{
			name: 'Ramon Diaz',
			role: 'Senior Barber',
			specialty: 'Skin fades · Beard sculpt',
			bio: 'Specialist in skin fades and beard sculpting. Brings a quiet precision to every chair.',
			image: 'team/ramon-diaz.jpg',
		},
		{
			name: 'Ethan Walker',
			role: 'Senior Barber',
			specialty: 'Hot towel · Classic cuts',
			bio: 'Classic cuts, side parts, and the most consistent hot-towel shaves in the shop.',
			image: 'team/ethan-walker.jpg',
		},
		{
			name: 'Kai Nakamura',
			role: 'Barber',
			specialty: 'Editorial · Line work',
			bio: 'Editorial training meets shop-floor speed. Modern shapes, textured tops, and detail line-work.',
			image: 'team/kai-nakamura.jpg',
		},
		{
			name: 'Dominic Pierce',
			role: 'Barber',
			specialty: 'Fades · Razor finish',
			bio: 'Tight fades, sharp edges, and the steadiest razor in the shop. Most-booked chair on Saturdays.',
			image: 'team/dominic-pierce.jpg',
		},
		{
			name: 'Rafael Santos',
			role: 'Barber',
			specialty: 'Hot towel · Beard work',
			bio: 'Old-school straight-razor work and beard sculpting. Trained in São Paulo, polished in Berlin.',
			image: 'team/rafael-santos.jpg',
		},
	],

	/** Values shown on About page */
	values: [
		{
			number: '01',
			title: 'Craft First',
			description:
				'Sharp tools, steady hands, no shortcuts. Every cut gets the time it needs.',
		},
		{
			number: '02',
			title: 'Honest Pricing',
			description:
				'One price per service. No bait-and-switch, no upsell at the chair.',
		},
		{
			number: '03',
			title: 'A Better Hour',
			description:
				"You're not just here for a cut — you're here for thirty quiet minutes that make the rest of the week better.",
		},
		{
			number: '04',
			title: 'Walk-Ins Welcome',
			description:
				'Appointments are easy, but a walk-in always gets a chair if there\'s one open.',
		},
	],
};
