import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInView } from '@/components/auth/sign-in-view';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
	return (
		<AuthShell kicker="Your account" title="Welcome back." line="Your visits, your shelf, and booking again in one tap.">
			<Suspense>
				<SignInView />
			</Suspense>
		</AuthShell>
	);
}
