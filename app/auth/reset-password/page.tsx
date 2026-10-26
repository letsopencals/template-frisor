import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/password-reset-forms';

export const metadata: Metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
	return (
		<AuthShell kicker="Your account" title="Set a new password.">
			<Suspense>
				<ResetPasswordForm />
			</Suspense>
		</AuthShell>
	);
}
