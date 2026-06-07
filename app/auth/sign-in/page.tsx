'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { siteConfig } from '@/lib/site-config';

export default function SignInPage() {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" /></div>}>
			<SignInContent />
		</Suspense>
	);
}

function SignInContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') ?? '/account';

	const [error, setError] = useState<string | null>(null);

	const form = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = async (data: SignInFormValues) => {
		setError(null);

		try {
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				setError('Invalid email or password.');
			} else {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setError('Something went wrong. Please try again.');
		}
	};

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
					<h1 className="mt-6 font-display text-3xl font-semibold text-[var(--color-cream)]">Welcome Back</h1>
					<p className="mt-2 text-sm text-[var(--color-cream-muted)]">Sign in to manage your appointments</p>
				</div>

				{error && (
					<div className="mt-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
						{error}
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-[var(--color-cream-muted)]">Email</FormLabel>
									<FormControl>
										<input
											{...field}
											type="email"
											placeholder="your@email.com"
											className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-[var(--color-cream-muted)]">Password</FormLabel>
									<FormControl>
										<input
											{...field}
											type="password"
											placeholder="Enter your password"
											className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-cream)] outline-none transition-colors placeholder:text-[var(--color-cream-dim)] focus:border-[var(--color-gold)]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Link href="/auth/forgot-password" className="text-xs text-[var(--color-cream-muted)] hover:text-[var(--color-gold)]">
								Forgot password?
							</Link>
						</div>

						<button
							type="submit"
							disabled={form.formState.isSubmitting}
							className="w-full bg-[var(--color-gold)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[var(--color-gold-bright)] disabled:opacity-50"
						>
							{form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
						</button>
					</form>
				</Form>

				<p className="mt-8 text-center text-sm text-[var(--color-cream-muted)]">
					Don&apos;t have an account?{' '}
					<Link href="/auth/sign-up" className="font-medium text-[var(--color-cream)] hover:text-[var(--color-gold)]">
						Sign up
					</Link>
				</p>
			</motion.div>
		</section>
	);
}
