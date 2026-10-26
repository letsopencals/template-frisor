import type { Metadata } from 'next';
import { AccountShell } from '@/components/account/account-shell';

export const metadata: Metadata = { title: 'Your account', robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return <AccountShell>{children}</AccountShell>;
}
