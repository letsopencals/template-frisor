import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
}

// Every button is a pill (rounded-full) — the canonical shape for this template.
const BASE =
	'inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.22em] transition-all disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
	// Gold — general-purpose primary CTA (header, marketing, forms).
	primary: 'bg-[var(--color-gold)] text-[var(--color-bg)] hover:bg-[var(--color-gold-bright)]',
	// Copper — booking-flow accent CTA.
	accent: 'bg-[var(--color-copper)] text-[var(--color-bg-deep)] hover:bg-[var(--color-copper-bright)]',
	outline:
		'border border-[var(--color-line-strong)] text-[var(--color-cream)] hover:border-[var(--color-cream)]/40',
	ghost: 'text-[var(--color-cream)] hover:text-[var(--color-copper)]',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'px-5 py-2 text-[0.6rem]',
	md: 'px-6 py-3 text-xs',
	lg: 'px-8 py-4 text-[0.7rem]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			type={type}
			className={clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
			{...props}
		/>
	);
});
