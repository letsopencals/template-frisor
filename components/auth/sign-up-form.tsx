'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

/** Create an account: name, email, password; then the verify-email step. */
export function SignUpForm() {
	const router = useRouter();
	const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '' });
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
	const submit = async (e: FormEvent) => {
		e.preventDefault();
		if (f.password.length < 8) return setError('Use at least 8 characters for the password.');
		setBusy(true);
		setError(null);
		const res = await fetch('/api/auth/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.email.trim(), password: f.password, firstName: f.firstName.trim() || undefined, lastName: f.lastName.trim() || undefined }) }).catch(() => null);
		setBusy(false);
		if (!res?.ok) {
			const body = await res?.json().catch(() => null);
			return setError(body?.error ?? 'We couldn’t create the account. Please try again.');
		}
		router.push(`/auth/verify-email?email=${encodeURIComponent(f.email.trim())}`);
	};
	return (
		<form onSubmit={submit} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label htmlFor="su-first" className="text-sm font-semibold">
						First name
					</label>
					<input id="su-first" autoComplete="given-name" value={f.firstName} onChange={set('firstName')} className="field mt-1.5" />
				</div>
				<div>
					<label htmlFor="su-last" className="text-sm font-semibold">
						Last name
					</label>
					<input id="su-last" autoComplete="family-name" value={f.lastName} onChange={set('lastName')} className="field mt-1.5" />
				</div>
			</div>
			<div>
				<label htmlFor="su-email" className="text-sm font-semibold">
					Email
				</label>
				<input id="su-email" type="email" required autoComplete="email" value={f.email} onChange={set('email')} className="field mt-1.5" />
			</div>
			<div>
				<label htmlFor="su-pw" className="text-sm font-semibold">
					Password
				</label>
				<input id="su-pw" type="password" required autoComplete="new-password" value={f.password} onChange={set('password')} className="field mt-1.5" />
				<p className="mt-1 text-xs text-ink-3">At least 8 characters.</p>
			</div>
			{error ? (
				<p role="alert" className="text-sm text-oxblood">
					{error}
				</p>
			) : null}
			<button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
				{busy ? 'Creating…' : 'Create account'}
			</button>
		</form>
	);
}
