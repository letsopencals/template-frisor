'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { siteConfig } from '@/lib/site-config';

const navLinks = [
	{ href: '/services', label: 'Services' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
];

export function Header() {
	const { data: session, status } = useSession();
	const { cart } = useCart();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);

	const cartItemCount = cart?.items?.length ?? 0;

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isMobileMenuOpen]);

	return (
		<>
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
					isScrolled
						? 'bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-line)]'
						: 'bg-transparent'
				}`}
			>
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="flex h-20 items-center justify-between">
						{/* Logo */}
						<Link href="/" className="relative z-10">
							<span className="font-display text-2xl font-semibold tracking-tight text-[var(--color-cream)]">
								{siteConfig.logo.text}
								<span className="text-[var(--color-gold)]">{siteConfig.logo.accent}</span>
							</span>
						</Link>

						{/* Desktop Nav */}
						<nav className="hidden items-center gap-10 md:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="link-underline text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-cream)]/75 transition-colors hover:text-[var(--color-cream)]"
								>
									{link.label}
								</Link>
							))}
						</nav>

						{/* Auth + Book Now + Mobile Toggle */}
						<div className="flex items-center gap-4">
							{status === 'authenticated' ? (
								<div className="hidden items-center gap-5 md:flex">
									<Link
										href="/account"
										className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-cream)]/75 transition-colors hover:text-[var(--color-cream)]"
									>
										{session.customer?.firstName || 'Account'}
									</Link>
									<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />
									<Link
										href="/services"
										className="rounded-full bg-[var(--color-gold)] px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
									>
										Book Appointment
									</Link>
								</div>
							) : (
								<div className="hidden items-center gap-5 md:flex">
									<Link
										href="/auth/sign-in"
										className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-cream)]/75 transition-colors hover:text-[var(--color-cream)]"
									>
										Sign In
									</Link>
									<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />
									<Link
										href="/services"
										className="rounded-full bg-[var(--color-gold)] px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
									>
										Book Appointment
									</Link>
								</div>
							)}

							{/* Mobile cart */}
							<div className="md:hidden">
								<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />
							</div>

							{/* Mobile hamburger */}
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
								aria-label="Toggle menu"
							>
								<motion.span
									animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
									className="block h-[2px] w-6 bg-[var(--color-cream)]"
								/>
								<motion.span
									animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
									className="block h-[2px] w-6 bg-[var(--color-cream)]"
								/>
								<motion.span
									animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
									className="block h-[2px] w-6 bg-[var(--color-cream)]"
								/>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Cart Drawer */}
			<CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-40 bg-[var(--color-bg)]"
					>
						<div className="flex h-full flex-col items-center justify-center gap-8 px-6">
							{navLinks.map((link, i) => (
								<motion.div
									key={link.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.1 + 0.2 }}
								>
									<Link
										href={link.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className="heading-display text-5xl text-[var(--color-cream)] transition-colors hover:text-[var(--color-gold)]"
									>
										{link.label}
									</Link>
								</motion.div>
							))}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								className="mt-4 flex flex-col items-center gap-4"
							>
								<Link
									href="/services"
									onClick={() => setIsMobileMenuOpen(false)}
									className="rounded-full bg-[var(--color-gold)] px-10 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-gold-bright)]"
								>
									Book Appointment
								</Link>
								{status === 'authenticated' ? (
									<>
										<Link
											href="/account"
											onClick={() => setIsMobileMenuOpen(false)}
											className="text-sm font-medium text-[var(--color-cream-muted)] hover:text-[var(--color-gold)]"
										>
											My Account
										</Link>
										<button
											onClick={() => {
												signOut();
												setIsMobileMenuOpen(false);
											}}
											className="text-sm font-medium text-[var(--color-cream-dim)] hover:text-[var(--color-gold)]"
										>
											Sign Out
										</button>
									</>
								) : (
									<Link
										href="/auth/sign-in"
										onClick={() => setIsMobileMenuOpen(false)}
										className="text-sm font-medium text-[var(--color-cream-muted)] hover:text-[var(--color-gold)]"
									>
										Sign In
									</Link>
								)}
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className="relative flex h-10 w-10 items-center justify-center text-[var(--color-cream)]/75 transition-colors hover:text-[var(--color-cream)]"
			aria-label={`Cart (${count} items)`}
		>
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
			</svg>
			{count > 0 && (
				<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[10px] font-bold text-[var(--color-bg)]">
					{count}
				</span>
			)}
		</button>
	);
}
