import Link from 'next/link';
import clsx from 'clsx';
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from 'react';

/**
 * Chamfered tag buttons (DESIGN.md "Shape"): clipped corners like a brass price tag.
 * `brass` is the primary action, `line` a brass keyline, `ink` the dark action on paper.
 * Pass only layout classes via `className`.
 */
export type TagVariant = 'brass' | 'line' | 'ink';
export type TagSize = 'sm' | 'md' | 'lg';

const SIZES: Record<TagSize, string> = {
	sm: 'h-9 px-4 text-[0.6875rem]',
	md: 'h-11 px-6',
	lg: 'h-14 px-8 text-[0.875rem]',
};

function classes(variant: TagVariant, size: TagSize, full?: boolean, className?: string) {
	return clsx('tag-btn', `tag-btn--${variant}`, SIZES[size], full && 'w-full', className);
}

interface TagButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: TagVariant;
	size?: TagSize;
	full?: boolean;
}

export const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(function TagButton(
	{ variant = 'brass', size = 'md', full, className, type = 'button', ...rest },
	ref,
) {
	return <button ref={ref} type={type} className={classes(variant, size, full, className)} {...rest} />;
});

interface TagLinkProps extends ComponentProps<typeof Link> {
	variant?: TagVariant;
	size?: TagSize;
	full?: boolean;
}

export function TagLink({ variant = 'brass', size = 'md', full, className, ...rest }: TagLinkProps) {
	return <Link className={classes(variant, size, full, className)} {...rest} />;
}
