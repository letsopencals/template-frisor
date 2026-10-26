'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);

/** Ask for a reset link (always answers the same, so accounts can't be probed). */
export function ForgotPasswordForm() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const submit = async (e: FormEvent) => {
		e.preventDefault();
		await post('/api/auth/forgot-password', { email: email.trim() });
		setSent(true);
	};
	if (sent) return <p className="text-ink-2">If there’s an account for {email}, a reset link is on its way.</p>;
	return (
		<form onSubmit={submit} className="space-y-4">
			<div>
				<label htmlFor="fp-email" className="text-sm font-semibold">
					Email
				</label>
				<input id="fp-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" />
			</div>
			<button type="submit" className="btn btn-primary btn-lg w-full">
				Send reset link
			</button>
			<p className="text-sm text-ink-2">
				Or skip the password:{' '}
				<Link href="/auth/sign-in" className="link font-semibold text-ink">
					sign in with a code
				</Link>
			</p>
		</form>
	);
}

/** Set a new password from the emailed `?token=`. */
export function ResetPasswordForm() {
	const token = useSearchParams().get('token') ?? '';
	const [pw, setPw] = useState('');
	const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
	const submit = async (e: FormEvent) => {
		e.preventDefault();
		if (pw.length < 8) return;
		setState('busy');
		const res = await post('/api/auth/reset-password', { token, newPassword: pw });
		setState(res?.ok ? 'done' : 'error');
	};
	if (!token) return <p className="text-oxblood">This link is missing its token. Ask for a new one.</p>;
	if (state === 'done') {
		return (
			<div className="space-y-4">
				<p className="text-ink-2">Password changed.</p>
				<Link href="/auth/sign-in" className="btn btn-primary">
					Sign in
				</Link>
			</div>
		);
	}
	return (
		<form onSubmit={submit} className="space-y-4">
			<div>
				<label htmlFor="rp-pw" className="text-sm font-semibold">
					New password
				</label>
				<input id="rp-pw" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="field mt-1.5" />
				<p className="mt-1 text-xs text-ink-3">At least 8 characters.</p>
			</div>
			{state === 'error' ? (
				<p role="alert" className="text-sm text-oxblood">
					That link has expired. <Link href="/auth/forgot-password" className="link">Ask for a new one</Link>.
				</p>
			) : null}
			<button type="submit" disabled={state === 'busy'} className="btn btn-primary btn-lg w-full">
				{state === 'busy' ? 'Saving…' : 'Set new password'}
			</button>
		</form>
	);
}
