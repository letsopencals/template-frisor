'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCheckout } from '@/contexts/checkout-context';
import { TagButton } from '@/components/ui/tag';

const FIELD = 'w-full border-0 border-b-2 border-towel-3 bg-transparent px-0 py-2 text-base text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none disabled:text-ink-2';

function Line({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
	return (
		<div>
			<label htmlFor={id} className="label text-[0.62rem] text-ink-3">
				{label}
			</label>
			{children}
			{error ? <p className="mt-1 text-xs text-oxblood">{error}</p> : null}
		</div>
	);
}

/** Docket part three: who's sitting. Written in on ruled lines, filed with one button. */
export function DocketContact() {
	const c = useCheckout();
	const filed = c.step !== 'customer';
	const err = (k: string) => c.fieldErrors[k];

	if (filed) {
		return (
			<div className="flex flex-wrap items-baseline justify-between gap-3">
				<p className="serif text-xl">
					{[c.firstName, c.lastName].filter(Boolean).join(' ') || c.email}
					<span className="block font-sans text-sm text-ink-2">
						{c.email}
						{c.phone ? ` · ${c.phone}` : ''}
					</span>
				</p>
				<button type="button" onClick={() => c.setStep('customer')} className="label strop text-[0.65rem] text-ink-2">
					Change
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={c.handleSaveCustomer} className="space-y-5" noValidate>
			{!c.signedIn ? (
				<p className="text-sm text-ink-2">
					Been before?{' '}
					<Link href="/auth/sign-in?callbackUrl=/checkout" className="strop font-semibold text-ink">
						Sign in
					</Link>{' '}
					and we fill this in.
				</p>
			) : null}
			<Line id="email" label="Email" error={err('email')}>
				<input id="email" type="email" required autoComplete="email" value={c.email} disabled={c.signedIn} onChange={(e) => c.setEmail(e.target.value)} className={FIELD} />
			</Line>
			<div className="grid gap-5 sm:grid-cols-2">
				<Line id="first" label={c.fields.firstNameRequired ? 'First name' : 'First name (optional)'} error={err('firstName')}>
					<input id="first" autoComplete="given-name" required={c.fields.firstNameRequired} value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} className={FIELD} />
				</Line>
				<Line id="last" label="Last name" error={err('lastName')}>
					<input id="last" autoComplete="family-name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} className={FIELD} />
				</Line>
			</div>
			{c.fields.phone !== 'hidden' ? (
				<Line id="phone" label={c.fields.phone === 'required' ? 'Phone' : 'Phone, if we need to reach you on the day'} error={err('phone')}>
					<input id="phone" type="tel" autoComplete="tel" required={c.fields.phone === 'required'} value={c.phone} onChange={(e) => c.setPhone(e.target.value)} className={FIELD} />
				</Line>
			) : null}
			{c.fields.billingAddress !== 'hidden' ? <BillingLines /> : null}
			{c.fields.consentChannels.length ? (
				<fieldset className="space-y-2">
					<legend className="label text-[0.62rem] text-ink-3">Now and then</legend>
					{c.fields.consentChannels.map((ch) => (
						<label key={ch} className="flex items-center gap-3 text-sm">
							<input type="checkbox" checked={c.consent[ch]} onChange={(e) => c.setConsent(ch, e.target.checked)} className="h-4 w-4 accent-[#4a2f1f]" />
							{ch === 'email' ? 'Email me when the shelf restocks and new barbers start' : ch === 'sms' ? 'Text me a reminder and offers' : 'WhatsApp me news'}
						</label>
					))}
				</fieldset>
			) : null}
			<TagButton type="submit" variant="ink" disabled={c.submitting || c.isExpired}>
				{c.submitting ? 'Filing…' : 'File it, then settle up'}
			</TagButton>
		</form>
	);
}

function BillingLines() {
	const c = useCheckout();
	const required = c.fields.billingAddress === 'required';
	if (!c.billingOpen) {
		return (
			<button type="button" onClick={() => c.setBillingOpen(true)} className="label strop text-[0.65rem] text-ink-2">
				+ Add a billing address for the receipt
			</button>
		);
	}
	const set = (k: 'addressLine1' | 'city' | 'postalCode' | 'companyName' | 'taxRegistrationId') => (e: React.ChangeEvent<HTMLInputElement>) => c.updateBilling({ [k]: e.target.value });
	return (
		<div className="grid gap-5 sm:grid-cols-2">
			{c.fields.companyName !== 'hidden' ? (
				<Line id="company" label="Company" error={c.fieldErrors['billingAddress.companyName']}>
					<input id="company" value={c.billing.companyName} onChange={set('companyName')} className={FIELD} />
				</Line>
			) : null}
			{c.fields.taxId !== 'hidden' ? (
				<Line id="vat" label="VAT number" error={c.fieldErrors['billingAddress.taxRegistrationId']}>
					<input id="vat" value={c.billing.taxRegistrationId} onChange={set('taxRegistrationId')} className={FIELD} />
				</Line>
			) : null}
			<Line id="street" label="Street" error={c.fieldErrors['billingAddress.addressLine1']}>
				<input id="street" required={required} autoComplete="address-line1" value={c.billing.addressLine1} onChange={set('addressLine1')} className={FIELD} />
			</Line>
			<div className="grid grid-cols-[6rem_1fr] gap-4">
				<Line id="zip" label="Postcode" error={c.fieldErrors['billingAddress.postalCode']}>
					<input id="zip" required={required} autoComplete="postal-code" value={c.billing.postalCode} onChange={set('postalCode')} className={FIELD} />
				</Line>
				<Line id="city" label="City" error={c.fieldErrors['billingAddress.city']}>
					<input id="city" required={required} autoComplete="address-level2" value={c.billing.city} onChange={set('city')} className={FIELD} />
				</Line>
			</div>
		</div>
	);
}
