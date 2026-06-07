'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { siteConfig } from '@/lib/site-config';

const contactFields = [
	{
		label: 'Visit Us',
		key: 'address' as const,
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
			</svg>
		),
	},
	{
		label: 'Call Us',
		key: 'phone' as const,
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
			</svg>
		),
	},
	{
		label: 'Email Us',
		key: 'email' as const,
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
			</svg>
		),
	},
	{
		label: 'Working Hours',
		key: 'hours' as const,
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
];

export default function ContactPage() {
	const formRef = useRef<HTMLDivElement>(null);
	const isFormInView = useInView(formRef, { once: true, margin: '-100px' });

	return (
		<>
			{/* Hero */}
			<section className="bg-[var(--color-bg)] pt-32 pb-20 lg:pt-40 lg:pb-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
					>
						Get in Touch
					</motion.p>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="heading-display mt-4 text-6xl text-[var(--color-cream)] md:text-7xl lg:text-8xl"
					>
						Let&apos;s
						<br />
						<span className="heading-display-italic text-[var(--color-gold)]">connect.</span>
					</motion.h1>
				</div>
			</section>

			{/* Contact Info + Form */}
			<section ref={formRef} className="bg-[var(--color-bg-deep)] py-section-sm lg:py-section">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="grid gap-16 lg:grid-cols-2">
						{/* Left — Contact info */}
						<div>
							<div className="grid gap-10 sm:grid-cols-2">
								{contactFields.map((field, i) => (
									<motion.div
										key={field.label}
										initial={{ opacity: 0, y: 20 }}
										animate={isFormInView ? { opacity: 1, y: 0 } : {}}
										transition={{ duration: 0.5, delay: i * 0.1 }}
									>
										<div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-gold)] text-[var(--color-bg)]">
											{field.icon}
										</div>
										<h3 className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)]">
											{field.label}
										</h3>
										<p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-cream-muted)]">
											{siteConfig.contact[field.key]}
										</p>
									</motion.div>
								))}
							</div>

							{/* Map placeholder */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={isFormInView ? { opacity: 1, y: 0 } : {}}
								transition={{ duration: 0.6, delay: 0.5 }}
								className="mt-12 aspect-video overflow-hidden rounded-2xl bg-[var(--color-surface)]"
							>
								<div className="flex h-full items-center justify-center text-sm text-[var(--color-cream-dim)]">
									Map will be displayed here
								</div>
							</motion.div>
						</div>

						{/* Right — Contact form */}
						<motion.div
							initial={{ opacity: 0, x: 30 }}
							animate={isFormInView ? { opacity: 1, x: 0 } : {}}
							transition={{ duration: 0.7, delay: 0.3 }}
							className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 lg:p-12"
						>
							<h2 className="heading-display text-3xl text-[var(--color-cream)]">
								Send us a message
							</h2>
							<p className="mt-3 text-sm text-[var(--color-cream-muted)]">
								Have a question or want to learn more? We&apos;d love to hear from you.
							</p>

							<form className="mt-8 space-y-6">
								<div className="grid gap-6 sm:grid-cols-2">
									<div>
										<label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]">
											First Name
										</label>
										<input
											type="text"
											className="mt-2 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
											placeholder="Jane"
										/>
									</div>
									<div>
										<label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]">
											Last Name
										</label>
										<input
											type="text"
											className="mt-2 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
											placeholder="Doe"
										/>
									</div>
								</div>
								<div>
									<label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]">
										Email
									</label>
									<input
										type="email"
										className="mt-2 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
										placeholder="jane@example.com"
									/>
								</div>
								<div>
									<label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]">
										Phone
									</label>
									<input
										type="tel"
										className="mt-2 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
										placeholder="+1 (212) 555-0000"
									/>
								</div>
								<div>
									<label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]">
										Message
									</label>
									<textarea
										rows={4}
										className="mt-2 w-full resize-none rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
										placeholder="Tell us what's on your mind…"
									/>
								</div>
								<button
									type="submit"
									className="w-full rounded-full bg-[var(--color-gold)] px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
								>
									Send Message
								</button>
							</form>
						</motion.div>
					</div>
				</div>
			</section>
		</>
	);
}
