'use client';

import { motion } from 'framer-motion';
import { LocationFilter } from './location-filter';

const EYEBROW_INITIAL = { opacity: 0, y: 20 };
const EYEBROW_ANIMATE = { opacity: 1, y: 0 };

export function ServicesHero() {
	return (
		<section id="services-hero" className="bg-[var(--color-bg)] pt-32 pb-16 lg:pt-40 lg:pb-20">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={EYEBROW_INITIAL}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
				>
					What We Offer
				</motion.p>
				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="heading-display mt-4 text-6xl text-[var(--color-cream)] md:text-7xl lg:text-8xl"
				>
					Our
					<br />
					<span className="heading-display-italic text-[var(--color-gold)]">services</span>
				</motion.h1>
				<motion.p
					initial={EYEBROW_INITIAL}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-cream-muted)]"
				>
					Classic cuts, hot-towel shaves, and beard work. Same price walk-in or by appointment.
				</motion.p>

				<LocationFilter />
			</div>
		</section>
	);
}
