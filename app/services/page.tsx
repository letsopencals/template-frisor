'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import type { ProductListItemResponse as Product } from '@opencals/storefront-sdk';
import { formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { useLocation } from '@/contexts/location-context';
import { useSettings } from '@/contexts/settings-context';
import { StaffAvatars } from '@/components/ui/staff-avatars';

function ServiceCard({ product, index }: { product: Product; index: number }) {
	const { currency } = useSettings();
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });
	const variants = product.variants ?? [];
	const imageUrl = getProductImage(variants[0]);
	const hasMultipleVariants = variants.length > 1;
	const primary = variants[0] ?? null;

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 30 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.6 }}
			className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
		>
			<div className="aspect-[16/9] w-full overflow-hidden image-placeholder">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={product.title ?? 'Service'}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="h-full w-full" />
				)}
			</div>

			<div className="p-7 lg:p-9">
				<div className="flex items-start justify-between gap-6">
					<div>
						<h2 className="heading-display text-3xl text-[var(--color-cream)] md:text-4xl">
							{product.title}
						</h2>
						{product.description && (
							<p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-cream-muted)]">
								{product.description}
							</p>
						)}
					</div>
					<span className="font-display text-sm text-[var(--color-gold)]">
						{String(index + 1).padStart(2, '0')}
					</span>
				</div>

				{hasMultipleVariants ? (
					<div className="mt-7 space-y-2">
						{variants.map((variant) => (
							<Link
								key={variant.id}
								href={`/booking/${variant.slug}`}
								className="group flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]/40 p-4 transition-all hover:border-[var(--color-gold)]/40"
							>
								<div>
									<p className="text-sm font-medium text-[var(--color-cream)]">{variant.variantTitle}</p>
									<div className="mt-1 flex items-center gap-3">
										<span className="text-xs text-[var(--color-cream-dim)]">
											{formatDuration(variant.duration)}
										</span>
										{variant.staffMembers && variant.staffMembers.length > 0 && (
											<StaffAvatars staffMembers={variant.staffMembers} maxVisible={4} size="sm" />
										)}
									</div>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-sm font-semibold text-[var(--color-gold)]">
										{formatPrice(variant.price, currency)}
									</span>
									<svg
										className="h-4 w-4 text-[var(--color-cream-dim)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-gold)]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
									</svg>
								</div>
							</Link>
						))}
					</div>
				) : (
					<>
						<div className="mt-7 flex flex-wrap items-center gap-6 text-sm">
							<div className="flex items-center gap-2 text-[var(--color-cream-muted)]">
								<svg className="h-4 w-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{formatDuration(primary?.duration ?? product.duration)}
							</div>
							<div className="flex items-center gap-2 text-[var(--color-cream-muted)]">
								<svg className="h-4 w-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8c1.11 0 2.08.4 2.6 1m-2.6-1V6m0 12v-2m0 0c-1.11 0-2.08-.4-2.6-1m-3.4 1a9 9 0 1116 0" />
								</svg>
								<span className="font-semibold text-[var(--color-gold)]">{formatPrice(primary?.price ?? product.price, currency)}</span>
							</div>
							{product.maxAttendees > 1 && (
								<div className="flex items-center gap-2 text-[var(--color-cream-muted)]">
									<svg className="h-4 w-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									Up to {product.maxAttendees}
								</div>
							)}
						</div>

						{primary?.staffMembers && primary.staffMembers.length > 0 && (
							<div className="mt-6">
								<StaffAvatars staffMembers={primary.staffMembers} maxVisible={5} size="md" />
							</div>
						)}

						<Link
							href={`/booking/${primary?.slug ?? product.slug}`}
							className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
						>
							Book Now
							<svg
								className="h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</>
				)}
			</div>
		</motion.div>
	);
}

function ServiceCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
			<div className="image-placeholder aspect-[16/9] animate-pulse" />
			<div className="space-y-4 p-7">
				<div className="h-8 w-1/2 animate-pulse rounded bg-[var(--color-surface-2)]" />
				<div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-2)]" />
				<div className="h-12 w-40 animate-pulse rounded-full bg-[var(--color-surface-2)]" />
			</div>
		</div>
	);
}

function LocationFilter() {
	const { locations, selectedLocationId, setSelectedLocationId, loading: locationsLoading } = useLocation();

	if (locationsLoading || locations.length <= 1) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.5 }}
			className="mt-10"
		>
			<div className="flex flex-wrap items-center gap-3">
				<button
					onClick={() => setSelectedLocationId(null)}
					className={`rounded-full border px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ${
						selectedLocationId === null
							? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-bg)]'
							: 'border-[var(--color-line-strong)] text-[var(--color-cream)] hover:border-[var(--color-cream)]/40'
					}`}
				>
					All Locations
				</button>
				{locations.map((location) => (
					<button
						key={location.id}
						onClick={() => setSelectedLocationId(location.id)}
						className={`rounded-full border px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ${
							selectedLocationId === location.id
								? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-bg)]'
								: 'border-[var(--color-line-strong)] text-[var(--color-cream)] hover:border-[var(--color-cream)]/40'
						}`}
					>
						{location.title ?? 'Location'}
					</button>
				))}
			</div>
		</motion.div>
	);
}

export default function ServicesPage() {
	const { selectedLocationId, setSelectedLocationId } = useLocation();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams();
				if (selectedLocationId) params.set('locationId', selectedLocationId);
				const res = await fetch(`/api/products?${params}`);
				if (!res.ok) {
					if (selectedLocationId && res.status === 400) {
						setSelectedLocationId(null);
						return;
					}
					throw new Error('Failed to fetch');
				}
				const data = await res.json();
				setProducts(data.data ?? []);
			} catch {
				setError('Unable to load services. Please try again later.');
			} finally {
				setLoading(false);
			}
		}

		fetchProducts();
	}, [selectedLocationId, setSelectedLocationId]);

	return (
		<>
			{/* Hero */}
			<section id="services-hero" className="bg-[var(--color-bg)] pt-32 pb-16 lg:pt-40 lg:pb-20">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]"
					>
						What We Offer
					</motion.p>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="heading-display mt-4 text-6xl text-[var(--color-cream)] md:text-7xl lg:text-8xl"
					>
						Our
						<br />
						<span className="heading-display-italic text-[var(--color-gold)]">services</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-cream-muted)]"
					>
						Classic cuts, hot-towel shaves, and beard work. Same price walk-in or by appointment.
					</motion.p>

					<LocationFilter />
				</div>
			</section>

			{/* Service list */}
			<section id="services-list" className="bg-[var(--color-bg)] pb-20 lg:pb-32">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					{loading && (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[0, 1, 2].map((i) => (
								<ServiceCardSkeleton key={i} />
							))}
						</div>
					)}

					{error && (
						<div className="py-20 text-center">
							<p className="text-[var(--color-cream-muted)]">{error}</p>
						</div>
					)}

					{!loading && !error && products.length === 0 && (
						<div className="py-20 text-center">
							<p className="text-[var(--color-cream-muted)]">No services available at the moment.</p>
						</div>
					)}

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{products.map((product, i) => (
							<ServiceCard key={product.id} product={product} index={i} />
						))}
					</div>
				</div>
			</section>

			{/* Bottom CTA */}
			<section id="services-cta" className="bg-[var(--color-gold)] py-20">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<h2 className="heading-display text-4xl text-[var(--color-bg)] md:text-5xl">
						Not sure which one?
					</h2>
					<p className="mx-auto mt-4 max-w-md text-base text-[var(--color-bg)]/75">
						Drop us a line — we&apos;ll point you at the right service and the right barber.
					</p>
					<div className="mt-8">
						<Link
							href="/contact"
							className="inline-flex items-center gap-3 rounded-full bg-[var(--color-bg)] px-10 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cream)] transition-all hover:bg-[var(--color-bg-deep)]"
						>
							Contact Us
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
