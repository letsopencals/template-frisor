'use client';

import { useState, type FormEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';

/**
 * Passwordless sign-in: email → a 6-digit code by email → signed in. Used inline at checkout
 * ("Been here before?") and on /auth/sign-in. `onDone` runs once the session is live.
 */
export function CodeSignIn({ initialEmail = '', onDone, onCancel, submitLabel = 'Sign in' }: { initialEmail?: string; onDone?: () => void; onCancel?: () => void; submitLabel?: string }) {
	const { update } = useSession();
	const [email, setEmail] = useState(initialEmail);
	const [code, setCode] = useState('');
	const [sent, setSent] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const send = async (e?: FormEvent) => {
		e?.preventDefault();
		if (!email.trim()) return;
		setBusy(true);
		setError(null);
		await fetch('/api/auth/request-login-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) }).catch(() => null);
		setBusy(false);
		setSent(true);
	};

	const verify = async (e: FormEvent) => {
		e.preventDefault();
		if (code.length < 6) return;
		setBusy(true);
		setError(null);
		const res = await signIn('login-code', { email: email.trim(), code, redirect: false });
		if (res?.error) {
			setError('That code didn’t work. Check the latest email, or send a new one.');
			setBusy(false);
			return;
		}
		await update();
		setBusy(false);
		onDone?.();
	};

	if (!sent) {
		return (
			<form onSubmit={send} className="space-y-3">
				<div>
					<label htmlFor="code-email" className="text-sm font-semibold">
						Email
					</label>
					<input id="code-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" />
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<button type="submit" disabled={busy} className="btn btn-primary">
						{busy ? 'Sending…' : 'Email me a code'}
					</button>
					{onCancel ? (
						<button type="button" onClick={onCancel} className="link text-sm text-ink-2">
							Cancel
						</button>
					) : null}
				</div>
			</form>
		);
	}

	return (
		<form onSubmit={verify} className="space-y-3">
			<p className="text-sm text-ink-2">
				If <span className="font-semibold text-ink">{email}</span> has an account, a 6-digit code is on its way.
			</p>
			<div>
				<label htmlFor="login-code" className="text-sm font-semibold">
					Code
				</label>
				<input
					id="login-code"
					inputMode="numeric"
					autoComplete="one-time-code"
					maxLength={6}
					value={code}
					onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
					className="field tabular mt-1.5 max-w-[12rem] text-center text-xl tracking-[0.4em]"
					aria-invalid={error ? true : undefined}
					autoFocus
				/>
			</div>
			{error ? (
				<p role="alert" className="text-sm text-oxblood">
					{error}
				</p>
			) : null}
			<div className="flex flex-wrap items-center gap-3">
				<button type="submit" disabled={busy || code.length < 6} className="btn btn-primary">
					{busy ? 'Checking…' : submitLabel}
				</button>
				<button type="button" onClick={() => void send()} disabled={busy} className="link text-sm text-ink-2">
					Send a new code
				</button>
				<button type="button" onClick={() => setSent(false)} className="link text-sm text-ink-2">
					Use another email
				</button>
			</div>
		</form>
	);
}
