import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata: Metadata = { title: 'Create an account' };

export default function SignUpPage() {
	return (
		<AuthShell kicker="Your account" title="Become a regular." line="Book again in one tap, move or cancel online, and restock your shelf.">
			<SignUpForm />
			<p className="mt-6 text-sm text-ink-2">
				Already have one?{' '}
				<Link href="/auth/sign-in" className="link font-semibold text-ink">
					Sign in
				</Link>
			</p>
		</AuthShell>
	);
}
