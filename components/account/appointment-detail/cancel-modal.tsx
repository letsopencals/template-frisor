'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CancelModal({
	appointmentId,
	serviceName,
	onClose,
	onCanceled,
}: {
	appointmentId: string;
	serviceName: string;
	onClose: () => void;
	onCanceled: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	async function handleCancel() {
		setSubmitting(true);
		setError('');
		try {
			const res = await fetch(`/api/account/appointments/${appointmentId}/cancel`, { method: 'PUT' });
			if (res.ok) {
				onCanceled();
			} else {
				const data = await res.json();
				setError(data.error ?? 'Failed to cancel appointment');
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
			<div className="w-full max-w-md rounded-2xl bg-[var(--color-bg)] p-8" onClick={(e) => e.stopPropagation()}>
				<h3 className="font-display text-xl font-semibold text-[var(--color-cream)]">Cancel Appointment</h3>
				<p className="mt-3 text-sm text-[var(--color-cream-muted)]">
					Are you sure you want to cancel your appointment for <span className="font-medium text-[var(--color-cream)]">{serviceName}</span>? This action cannot be undone.
				</p>

				{error ? (
					<div className="mt-4 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
						{error}
					</div>
				) : null}

				<div className="mt-6 flex gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={submitting}
						className="flex-1"
					>
						Keep Appointment
					</Button>
					<button
						onClick={handleCancel}
						disabled={submitting}
						className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-red-700 disabled:opacity-50"
					>
						{submitting ? 'Canceling...' : 'Cancel Appointment'}
					</button>
				</div>
			</div>
		</div>
	);
}
