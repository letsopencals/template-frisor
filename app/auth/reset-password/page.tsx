'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { siteConfig } from '@/lib/site-config';

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" /></div>}>
			<ResetPasswordContent />
		</Suspense>
	);
}

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';

	const [success, setSuccess] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: '', confirmPassword: '' },
	});

	const { submit, isSubmitting, error } = useFormSubmit(form, { url: '/api/auth/reset-password' });

	const onSubmit = async (data: ResetPasswordFormValues) => {
		const result = await submit({
			token,
			new_password: data.password,
		});

		if (result !== null) {
			setSuccess(true);
			setTimeout(() => router.push('/auth/sign-in'), 3000);
		}
	};

	if (!token) {
		return (
			<section className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 pt-20 pb-20">
				<div className="text-center">
					<p className="text-[var(--color-cream-muted)]">Invalid or missing reset token.</p>
					<Link href="/auth/forgot-password" className="mt-4 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline">
						Request a new reset link
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 pt-20 pb-20">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-[440px]"
			>
				<div className="text-center">
					<Link href="/" className="font-display text-2xl font-bold tracking-tight text-[var(--color-cream)]">
						{siteConfig.logo.text}<span className="text-[var(--color-gold)]">{siteConfig.logo.accent}</span>
					</Link>
					<h1 className="mt-6 font-display text-3xl font-semibold text-[var(--color-cream)]">Reset Password</h1>
					<p className="mt-2 text-sm text-[var(--color-cream-muted)]">Enter your new password</p>
				</div>

				{success ? (
					<div className="mt-8 border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
						<svg className="mx-auto h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
						<p className="mt-4 text-sm font-medium text-green-800">Password reset successful</p>
						<p className="mt-1 text-xs text-emerald-400">Redirecting to sign in...</p>
					</div>
				) : (
					<>
						{error && (
							<div className="mt-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
								{error}
							</div>
						)}

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-[var(--color-cream-muted)]">New Password</FormLabel>
											<FormControl>
												<input
													{...field}
													type="password"
													placeholder="Min. 6 characters"
													className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-[var(--color-cream-muted)]">Confirm Password</FormLabel>
											<FormControl>
												<input
													{...field}
													type="password"
													placeholder="Confirm your password"
													className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full bg-[var(--color-gold)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[var(--color-gold-bright)] disabled:opacity-50"
								>
									{isSubmitting ? 'Resetting...' : 'Reset Password'}
								</button>
							</form>
						</Form>
					</>
				)}

				<p className="mt-8 text-center text-sm text-[var(--color-cream-muted)]">
					<Link href="/auth/sign-in" className="font-medium text-[var(--color-cream)] hover:text-[var(--color-gold)]">
						Back to sign in
					</Link>
				</p>
			</motion.div>
		</section>
	);
}
