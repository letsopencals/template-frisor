'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

function StorySection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<section ref={ref} className="bg-[var(--color-bg)] py-section-sm lg:py-section">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="grid items-center gap-16 lg:grid-cols-2">
					{/* Images */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8 }}
						className="relative"
					>
						<div className="grid grid-cols-12 gap-4">
							<div
								className="image-placeholder col-span-7 aspect-[3/4] overflow-hidden rounded-2xl bg-cover bg-center object-cover"
								style={{ backgroundImage: `url('/images/about/about-shop.jpg')` }}
							/>
							<div
								className="image-placeholder col-span-5 mt-12 aspect-[3/4] overflow-hidden rounded-2xl bg-cover bg-center object-cover"
								style={{ backgroundImage: `url('/images/about/about-detail.jpg')` }}
							/>
						</div>
						<div className="absolute -bottom-4 left-0 h-1 w-24 bg-[var(--color-gold)]" />
					</motion.div>

					{/* Content */}
					<div>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
						>
							Our Story
						</motion.p>
						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.7, delay: 0.3 }}
							className="heading-display mt-4 text-4xl text-[var(--color-cream)] md:text-5xl"
						>
							Built around
							<br />
							<span className="heading-display-italic text-[var(--color-gold)]">the chair.</span>
						</motion.h2>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.5 }}
							className="mt-8 space-y-4 text-base leading-relaxed text-[var(--color-cream-muted)]"
						>
							{siteConfig.about.storyParagraphs.map((p, i) => (
								<p key={i}>{p}</p>
							))}
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ValuesSection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<section ref={ref} className="noise-overlay relative bg-[var(--color-bg-deep)] py-section-sm lg:py-section">
			<div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
				>
					What Drives Us
				</motion.p>
				<motion.h2
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.7, delay: 0.1 }}
					className="heading-display mt-4 text-5xl text-[var(--color-cream)] md:text-6xl"
				>
					Our values
				</motion.h2>

				<div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-[var(--color-line)] md:grid-cols-2">
					{siteConfig.values.map((value, i) => (
						<motion.div
							key={value.number}
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
							className="bg-[var(--color-surface)] p-10 lg:p-14"
						>
							<span className="font-display text-sm text-[var(--color-gold)]">{value.number}</span>
							<h3 className="heading-display mt-4 text-2xl text-[var(--color-cream)]">{value.title}</h3>
							<p className="mt-4 text-sm leading-relaxed text-[var(--color-cream-muted)]">
								{value.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

function TeamSection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<section ref={ref} id="team" className="bg-[var(--color-bg)] py-section-sm lg:py-section">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
				>
					The Chair
				</motion.p>
				<motion.h2
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.7, delay: 0.1 }}
					className="heading-display mt-4 text-5xl text-[var(--color-cream)] md:text-6xl"
				>
					Meet the
					<br />
					<span className="heading-display-italic text-[var(--color-gold)]">barbers</span>
				</motion.h2>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{siteConfig.team.map((member, i) => (
						<motion.div
							key={member.name}
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
							className="group"
						>
							<div className="aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--color-line)]">
								<div
									className="image-placeholder h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
									style={{ backgroundImage: `url('/images/${member.image}')` }}
								/>
							</div>
							<h3 className="mt-6 font-display text-xl font-semibold text-[var(--color-cream)]">
								{member.name}
							</h3>
							<p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
								{member.role}
							</p>
							<p className="mt-3 text-sm leading-relaxed text-[var(--color-cream-muted)]">
								{member.bio}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

export default function AboutPage() {
	const { about } = siteConfig;

	return (
		<>
			{/* Page hero */}
			<section className="relative bg-[var(--color-bg)] pt-32 pb-20 lg:pt-40 lg:pb-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
					>
						{about.heroSubtitle}
					</motion.p>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="heading-display mt-4 text-6xl text-[var(--color-cream)] md:text-7xl lg:text-8xl"
					>
						{about.heroHeading.map((line, i) => (
							<span key={i}>
								{line}
								<br />
							</span>
						))}
						<span className="heading-display-italic text-[var(--color-gold)]">{about.heroHeadingAccent}</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-cream-muted)]"
					>
						{about.heroBody}
					</motion.p>
				</div>
			</section>

			<StorySection />
			<ValuesSection />
			<TeamSection />

			{/* Bottom CTA */}
			<section className="bg-[var(--color-bg)] py-20 lg:py-28">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<h2 className="heading-display text-4xl text-[var(--color-cream)] md:text-5xl">
						{about.bottomCta}
					</h2>
					<p className="mx-auto mt-4 max-w-md text-base text-[var(--color-cream-muted)]">
						{about.bottomCtaBody}
					</p>
					<div className="mt-8">
						<Link
							href="/services"
							className="inline-flex items-center gap-3 rounded-full bg-[var(--color-gold)] px-10 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
						>
							Book Now
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
