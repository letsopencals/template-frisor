'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CodeSignIn } from '@/components/auth/code-sign-in';
import { PasswordSignIn } from '@/components/auth/password-sign-in';

/** /auth/sign-in: a code by email first (no password needed), a password if you set one. */
export function SignInView() {
	const router = useRouter();
	const params = useSearchParams();
	const [mode, setMode] = useState<'code' | 'password'>('code');
	const raw = params.get('callbackUrl') ?? '/account';
	const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';
	const done = () => {
		router.push(next);
		router.refresh();
	};
	return (
		<div>
			{mode === 'code' ? <CodeSignIn onDone={done} /> : <PasswordSignIn onDone={done} />}
			<div className="mt-8 space-y-2 border-t border-paper-3 pt-6 text-sm text-ink-2">
				<p>
					{mode === 'code' ? 'Set a password before?' : 'Rather not type a password?'}{' '}
					<button type="button" onClick={() => setMode(mode === 'code' ? 'password' : 'code')} className="link font-semibold text-ink">
						{mode === 'code' ? 'Sign in with your password' : 'Email me a code instead'}
					</button>
				</p>
				<p>
					New here? An account is made for you when you book.{' '}
					<Link href="/auth/sign-up" className="link font-semibold text-ink">
						Or create one now
					</Link>
				</p>
			</div>
		</div>
	);
}
