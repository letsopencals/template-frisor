'use client';

import { useCheckout } from '@/contexts/checkout-context';

/** "We're holding your chair for 9:41" or, once it lapses, a button to hold it again. */
export function HoldTimer() {
	const c = useCheckout();
	if (c.isExpired) {
		return (
			<p className="text-sm text-oxblood" role="status">
				Your hold ran out.{' '}
				<button type="button" onClick={() => c.extendCart()} className="link font-semibold">
					Hold it again
				</button>
			</p>
		);
	}
	if (c.timeRemaining === null) return null;
	const m = Math.max(0, Math.floor(c.timeRemaining / 60));
	const s = Math.max(0, c.timeRemaining % 60);
	return (
		<p className="text-sm text-ink-2">
			We’re holding your chair for{' '}
			<span className="tabular font-semibold text-ink">
				{m}:{String(s).padStart(2, '0')}
			</span>
		</p>
	);
}
