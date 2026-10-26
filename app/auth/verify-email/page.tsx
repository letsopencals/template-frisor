import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { VerifyEmailView } from '@/components/auth/verify-email-view';

export const metadata: Metadata = { title: 'Check your email' };

export default function VerifyEmailPage() {
	return (
		<AuthShell kicker="One more step" title="Check your email.">
			<Suspense>
				<VerifyEmailView />
			</Suspense>
		</AuthShell>
	);
}
