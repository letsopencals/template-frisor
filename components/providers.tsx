'use client';

import type { StorePublicSettings } from '@opencals/storefront-sdk';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/cart-context';
import { SettingsProvider } from '@/contexts/settings-context';

/** Session, store settings (seeded from the server) and the cart. Shop and time zone come from the URL and the store. */
export function Providers({ children, initialSettings = null }: { children: React.ReactNode; initialSettings?: StorePublicSettings | null }) {
	return (
		<SessionProvider>
			<SettingsProvider initialSettings={initialSettings}>
				<CartProvider>{children}</CartProvider>
			</SettingsProvider>
		</SessionProvider>
	);
}
