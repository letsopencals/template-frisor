'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveLink } from '@/lib/actions/resolve-link';

/** Emailed links (`/link/{token}`): sign in and go where the link points. */
export function LinkResolver({ token }: { token: string }) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const ran = useRef(false);
	useEffect(() => {
		if (ran.current) return;
		ran.current = true;
		void resolveLink(token).then((r) => {
			if (!r.success) return setError(r.errorCode === 'TOKEN_EXPIRED' ? 'This link has expired.' : r.errorCode === 'TOKEN_USED' ? 'This link was already used.' : 'This link doesn’t work.');
			const path = r.redirectPath && r.redirectPath.startsWith('/') && !r.redirectPath.startsWith('//') ? r.redirectPath : '/account';
			router.replace(path);
			router.refresh();
		});
	}, [token, router]);
	if (error) {
		return (
			<div className="space-y-4">
				<p className="text-oxblood">{error}</p>
				<Link href="/auth/sign-in" className="btn btn-primary">
					Sign in with a code
				</Link>
			</div>
		);
	}
	return <p className="text-ink-2">Opening your link…</p>;
}
