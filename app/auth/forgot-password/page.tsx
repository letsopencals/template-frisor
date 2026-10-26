import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/password-reset-forms';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
	return (
		<AuthShell kicker="Your account" title="Forgot your password?" line="We’ll email you a link to set a new one.">
			<ForgotPasswordForm />
		</AuthShell>
	);
}
