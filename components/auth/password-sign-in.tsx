'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';

/** Email + password sign-in, for customers who set a password. */
export function PasswordSignIn({ onDone }: { onDone: () => void }) {
	const { update } = useSession();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const submit = async (e: FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		const res = await signIn('credentials', { email: email.trim(), password, redirect: false });
		setBusy(false);
		if (res?.error) return setError('That email and password don’t match.');
		await update();
		onDone();
	};
	return (
		<form onSubmit={submit} className="space-y-4">
			<div>
				<label htmlFor="pw-email" className="text-sm font-semibold">
					Email
				</label>
				<input id="pw-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" />
			</div>
			<div>
				<div className="flex items-baseline justify-between">
					<label htmlFor="pw-password" className="text-sm font-semibold">
						Password
					</label>
					<Link href="/auth/forgot-password" className="link text-xs text-ink-2">
						Forgot it?
					</Link>
				</div>
				<input id="pw-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1.5" />
			</div>
			{error ? (
				<p role="alert" className="text-sm text-oxblood">
					{error}
				</p>
			) : null}
			<button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
				{busy ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
	);
}
