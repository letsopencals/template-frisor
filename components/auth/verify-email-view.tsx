'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

/** With `?token=`: verify and sign in. Without: "check your inbox" with a resend button. */
export function VerifyEmailView() {
	const params = useSearchParams();
	const router = useRouter();
	const token = params.get('token');
	const email = params.get('email');
	const [state, setState] = useState<'idle' | 'verifying' | 'failed' | 'resent'>(token ? 'verifying' : 'idle');
	const ran = useRef(false);

	useEffect(() => {
		if (!token || ran.current) return;
		ran.current = true;
		void signIn('verify-token', { token, redirect: false }).then((res) => {
			if (res?.error) return setState('failed');
			router.push('/account');
			router.refresh();
		});
	}, [token, router]);

	const resend = async () => {
		if (!email) return;
		await fetch('/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => null);
		setState('resent');
	};

	if (state === 'verifying') return <p className="text-ink-2">Checking your link…</p>;
	if (state === 'failed') {
		return (
			<div className="space-y-4">
				<p className="text-oxblood">That link has expired or was already used.</p>
				<Link href="/auth/sign-in" className="btn btn-primary">
					Sign in with a code instead
				</Link>
			</div>
		);
	}
	return (
		<div className="space-y-4">
			<p className="text-ink-2">
				We’ve sent a link to {email ? <span className="font-semibold text-ink">{email}</span> : 'your inbox'}. Open it on this device to finish.
			</p>
			{email ? (
				<button type="button" onClick={resend} disabled={state === 'resent'} className="btn btn-outline">
					{state === 'resent' ? 'Sent again' : 'Send it again'}
				</button>
			) : null}
		</div>
	);
}
