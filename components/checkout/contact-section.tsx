'use client';

import { useState, type ReactNode } from 'react';
import { useCheckout } from '@/contexts/checkout-context';
import { CodeSignIn } from '@/components/auth/code-sign-in';

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
	return (
		<div>
			<label htmlFor={id} className="text-sm font-semibold">
				{label}
			</label>
			<div className="mt-1.5">{children}</div>
			{error ? <p className="mt-1 text-xs text-oxblood">{error}</p> : null}
		</div>
	);
}

const CONSENT_COPY: Record<string, string> = {
	email: 'Email me when the shelf restocks and new barbers start',
	sms: 'Text me reminders and the odd offer',
	whatsapp: 'Send me news on WhatsApp',
};

/** Checkout section 1: contact details, with "Been here before? Sign in with a code" inline. */
export function ContactSection() {
	const c = useCheckout();
	const [codeOpen, setCodeOpen] = useState(false);
	const saved = c.step !== 'customer';
	const err = (k: string) => c.fieldErrors[k];

	if (saved) {
		return (
			<div className="flex flex-wrap items-start justify-between gap-3">
				<p className="text-[0.95rem]">
					<span className="font-semibold">{[c.firstName, c.lastName].filter(Boolean).join(' ') || c.email}</span>
					<span className="block text-sm text-ink-2">
						{c.email}
						{c.phone ? ` · ${c.phone}` : ''}
					</span>
				</p>
				<button type="button" onClick={() => c.setStep('customer')} className="link min-h-[44px] text-sm text-ink-2">
					Edit
				</button>
			</div>
		);
	}

	if (codeOpen && !c.signedIn) {
		return (
			<div>
				<p className="mb-4 text-sm text-ink-2">We’ll email you a code; your details fill in by themselves.</p>
				<CodeSignIn initialEmail={c.email} onDone={() => setCodeOpen(false)} onCancel={() => setCodeOpen(false)} submitLabel="Sign in and continue" />
			</div>
		);
	}

	return (
		<form onSubmit={c.handleSaveCustomer} className="space-y-4" noValidate>
			{c.signedIn ? (
				<p className="text-sm text-ink-2">Signed in. Check your details and continue.</p>
			) : (
				<p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-2">
					Been here before?
					<button type="button" onClick={() => setCodeOpen(true)} className="link min-h-[32px] font-semibold text-ink">
						Sign in with a code
					</button>
				</p>
			)}
			<Field id="email" label="Email" error={err('email')}>
				<input id="email" type="email" required autoComplete="email" value={c.email} disabled={c.signedIn} onChange={(e) => c.setEmail(e.target.value)} className="field disabled:opacity-70" aria-invalid={err('email') ? true : undefined} />
			</Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field id="first" label={c.fields.firstNameRequired ? 'First name' : 'First name (optional)'} error={err('firstName')}>
					<input id="first" autoComplete="given-name" required={c.fields.firstNameRequired} value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} className="field" />
				</Field>
				<Field id="last" label="Last name" error={err('lastName')}>
					<input id="last" autoComplete="family-name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} className="field" />
				</Field>
			</div>
			{c.fields.phone !== 'hidden' ? (
				<Field id="phone" label={c.fields.phone === 'required' ? 'Phone' : 'Phone (optional, for running-late calls)'} error={err('phone')}>
					<input id="phone" type="tel" autoComplete="tel" required={c.fields.phone === 'required'} value={c.phone} onChange={(e) => c.setPhone(e.target.value)} className="field" />
				</Field>
			) : null}
			{c.fields.billingAddress !== 'hidden' ? <BillingFields /> : null}
			{c.fields.consentChannels.length ? (
				<fieldset className="space-y-2 pt-1">
					<legend className="sr-only">Keeping in touch</legend>
					{c.fields.consentChannels.map((ch) => (
						<label key={ch} className="flex min-h-[32px] items-center gap-3 text-sm">
							<input type="checkbox" checked={c.consent[ch]} onChange={(e) => c.setConsent(ch, e.target.checked)} className="h-4 w-4 accent-[#1e3a2f]" />
							{CONSENT_COPY[ch] ?? ch}
						</label>
					))}
				</fieldset>
			) : null}
			<button type="submit" disabled={c.submitting || c.isExpired} className="btn btn-primary btn-lg w-full sm:w-auto">
				{c.submitting ? 'Saving…' : 'Continue to payment'}
			</button>
		</form>
	);
}

function BillingFields() {
	const c = useCheckout();
	const required = c.fields.billingAddress === 'required';
	if (!c.billingOpen) {
		return (
			<button type="button" onClick={() => c.setBillingOpen(true)} className="link text-sm text-ink-2">
				+ Add a billing address for the receipt
			</button>
		);
	}
	const set = (k: 'addressLine1' | 'city' | 'postalCode' | 'companyName' | 'taxRegistrationId') => (e: React.ChangeEvent<HTMLInputElement>) => c.updateBilling({ [k]: e.target.value });
	const fe = (k: string) => c.fieldErrors[`billingAddress.${k}`];
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{c.fields.companyName !== 'hidden' ? (
				<Field id="company" label="Company (optional)" error={fe('companyName')}>
					<input id="company" value={c.billing.companyName} onChange={set('companyName')} className="field" />
				</Field>
			) : null}
			{c.fields.taxId !== 'hidden' ? (
				<Field id="vat" label="VAT number (optional)" error={fe('taxRegistrationId')}>
					<input id="vat" value={c.billing.taxRegistrationId} onChange={set('taxRegistrationId')} className="field" />
				</Field>
			) : null}
			<Field id="street" label="Street" error={fe('addressLine1')}>
				<input id="street" required={required} autoComplete="address-line1" value={c.billing.addressLine1} onChange={set('addressLine1')} className="field" />
			</Field>
			<div className="grid grid-cols-[7rem_1fr] gap-3">
				<Field id="zip" label="Postcode" error={fe('postalCode')}>
					<input id="zip" required={required} autoComplete="postal-code" value={c.billing.postalCode} onChange={set('postalCode')} className="field" />
				</Field>
				<Field id="city" label="City" error={fe('city')}>
					<input id="city" required={required} autoComplete="address-level2" value={c.billing.city} onChange={set('city')} className="field" />
				</Field>
			</div>
		</div>
	);
}
