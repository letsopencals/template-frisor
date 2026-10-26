import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LinkResolver } from '@/components/auth/link-resolver';

export const metadata: Metadata = { title: 'Opening your link', robots: { index: false, follow: false } };

export default async function LinkPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	return (
		<AuthShell kicker="One moment" title="Opening your link.">
			<LinkResolver token={token} />
		</AuthShell>
	);
}
