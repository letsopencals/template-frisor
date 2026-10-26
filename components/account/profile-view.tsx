'use client';

import { useEffect, useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher } from '@/lib/fetcher';
import type { AccountConsent } from '@/lib/account-types';

interface Profile {
	email?: string;
	firstName?: string | null;
	lastName?: string | null;
	phone?: string | null;
}

const send = (url: string, body: unknown) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);

function Saved({ msg }: { msg: string | null }) {
	return msg ? (
		<p role="status" className="text-sm text-green">
			{msg}
		</p>
	) : null;
}

function DetailsForm() {
	const { data, mutate } = useSWR<Profile>('/api/account/profile', fetcher, { revalidateOnFocus: false });
	const { update } = useSession();
	const [f, setF] = useState({ firstName: '', lastName: '', phone: '' });
	const [msg, setMsg] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		if (data) setF({ firstName: data.firstName ?? '', lastName: data.lastName ?? '', phone: data.phone ?? '' });
	}, [data]);
	const save = async (e: FormEvent) => {
		e.preventDefault();
		setBusy(true);
		const res = await send('/api/account/profile', f);
		setBusy(false);
		setMsg(res?.ok ? 'Saved.' : 'We couldn’t save that. Please try again.');
		if (res?.ok) {
			void mutate();
			void update();
		}
	};
	return (
		<form onSubmit={save} className="space-y-4">
			<h2 className="display text-3xl">Your details</h2>
			<div>
				<label className="text-sm font-semibold" htmlFor="p-email">
					Email
				</label>
				<input id="p-email" value={data?.email ?? ''} disabled className="field mt-1.5 opacity-70" />
				<p className="mt-1 text-xs text-ink-3">To change your email, ask at the shop.</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{(['firstName', 'lastName'] as const).map((k) => (
					<div key={k}>
						<label className="text-sm font-semibold" htmlFor={`p-${k}`}>
							{k === 'firstName' ? 'First name' : 'Last name'}
						</label>
						<input id={`p-${k}`} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="field mt-1.5" autoComplete={k === 'firstName' ? 'given-name' : 'family-name'} />
					</div>
				))}
			</div>
			<div>
				<label className="text-sm font-semibold" htmlFor="p-phone">
					Phone
				</label>
				<input id="p-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="field mt-1.5" autoComplete="tel" />
			</div>
			<div className="flex items-center gap-4">
				<button type="submit" disabled={busy} className="btn btn-primary">
					{busy ? 'Saving…' : 'Save details'}
				</button>
				<Saved msg={msg} />
			</div>
		</form>
	);
}

function ConsentForm() {
	const { data, mutate } = useSWR<AccountConsent>('/api/account/marketing-consent', fetcher, { revalidateOnFocus: false });
	const [msg, setMsg] = useState<string | null>(null);
	const toggle = async (k: keyof AccountConsent, v: boolean) => {
		const res = await send('/api/account/marketing-consent', { [k]: v });
		setMsg(res?.ok ? 'Updated.' : 'We couldn’t update that.');
		if (res?.ok) void mutate(await res.json(), { revalidate: false });
	};
	const rows: [keyof AccountConsent, string][] = [
		['email', 'Email: shelf restocks, new barbers, the odd offer'],
		['sms', 'Text messages'],
		['whatsapp', 'WhatsApp'],
	];
	return (
		<section aria-label="Messages from us" className="space-y-3">
			<h2 className="display text-3xl">Messages from us</h2>
			<p className="text-sm text-ink-2">Booking confirmations and reminders always come. These are the extras.</p>
			{rows.map(([k, label]) => (
				<label key={k} className="flex min-h-[44px] items-center gap-3">
					<input type="checkbox" checked={data?.[k] === 'subscribed'} disabled={!data} onChange={(e) => toggle(k, e.target.checked)} className="h-4 w-4 accent-[#1e3a2f]" />
					{label}
				</label>
			))}
			<Saved msg={msg} />
		</section>
	);
}

function PasswordForm() {
	const [cur, setCur] = useState('');
	const [next, setNext] = useState('');
	const [msg, setMsg] = useState<string | null>(null);
	const save = async (e: FormEvent) => {
		e.preventDefault();
		if (next.length < 8) return setMsg('Use at least 8 characters.');
		const res = await send('/api/account/password', { currentPassword: cur, newPassword: next });
		setMsg(res?.ok ? 'Password changed.' : 'That didn’t work. Check your current password.');
		if (res?.ok) {
			setCur('');
			setNext('');
		}
	};
	return (
		<form onSubmit={save} className="space-y-4">
			<h2 className="display text-3xl">Password</h2>
			<p className="text-sm text-ink-2">Optional. You can always sign in with a code by email instead.</p>
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className="text-sm font-semibold" htmlFor="pw-cur">
						Current password
					</label>
					<input id="pw-cur" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} className="field mt-1.5" />
				</div>
				<div>
					<label className="text-sm font-semibold" htmlFor="pw-new">
						New password
					</label>
					<input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className="field mt-1.5" />
				</div>
			</div>
			<div className="flex items-center gap-4">
				<button type="submit" disabled={!next} className="btn btn-outline">
					Change password
				</button>
				<Saved msg={msg} />
			</div>
		</form>
	);
}

/** /account/profile: details, message preferences and password. */
export function ProfileView() {
	return (
		<div className="grid gap-14 lg:grid-cols-[3fr_2fr] lg:gap-20">
			<DetailsForm />
			<div className="space-y-14">
				<ConsentForm />
				<PasswordForm />
			</div>
		</div>
	);
}
