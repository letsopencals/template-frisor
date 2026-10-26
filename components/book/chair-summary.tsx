'use client';

import type { ReactNode } from 'react';
import { money, sittingLength } from '@/lib/catalog';
import { longDate, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import type { ChairBooking } from '@/hooks/use-chair-booking';

export type BookStep = 1 | 2 | 3;

export interface PrimaryAction {
	label: string;
	/** Shorter label for the phone bar. */
	short?: string;
	disabled: boolean;
	busy?: boolean;
	onClick: () => void;
}

/** Selected add-on lines (extras and shelf) with prices, plus the SHELF15 estimate. */
export function chairLines(b: ChairBooking) {
	const lines = [...b.addOns.selectedAddOns.entries()]
		.filter(([, q]) => q > 0)
		.map(([id, q]) => {
			const a = b.addOns.availableAddOns.find((x) => x.id === id);
			return a ? { id, title: a.title, quantity: q, total: a.price * q } : null;
		})
		.filter((l): l is { id: string; title: string; quantity: number; total: number } => !!l);
	const pct = siteConfig.shelf.autoCode ? 0.15 : 0;
	const saving = Math.round(b.shelfTotal * pct * 100) / 100;
	return { lines, saving, total: Math.max(0, b.total - saving) };
}

function Row({ label, children, onEdit }: { label: string; children: ReactNode; onEdit?: () => void }) {
	return (
		<div className="flex items-start gap-3 py-3">
			<dt className="label w-16 shrink-0 pt-0.5 text-[0.6rem] text-ink-3">{label}</dt>
			<dd className="min-w-0 flex-1 text-[0.92rem] leading-snug">{children}</dd>
			{onEdit ? (
				<button type="button" onClick={onEdit} className="link shrink-0 text-xs text-ink-2">
					Change
				</button>
			) : null}
		</div>
	);
}

/** "Your chair": what's chosen so far, the running total and the step's primary action. */
export function ChairSummary({ b, currency, primary, onEdit, secondary, hideAction = false }: { b: ChairBooking; currency: string; primary: PrimaryAction; onEdit: (s: BookStep) => void; secondary?: ReactNode; hideAction?: boolean }) {
	const { lines, saving, total } = chairLines(b);
	const at = b.selected?.at ?? null;
	const who = b.barber?.name ?? (at && b.finalBarber ? `${b.finalBarber.name} (first free)` : 'Any barber');

	return (
		<div className="apoth p-5">
			<p className="label text-brass-lo">Your chair</p>
			<dl className="mt-1 divide-y divide-paper-3">
				<Row label="Shop" onEdit={() => onEdit(1)}>
					{b.shop?.title ?? '—'}
				</Row>
				<Row label="Service" onEdit={b.service ? () => onEdit(1) : undefined}>
					{b.service ? (
						<>
							<span className="serif">{b.service.name}</span>
							<span className="block text-xs text-ink-3">
								{sittingLength(b.service.duration)} · {money(b.service.price, currency)}
							</span>
						</>
					) : (
						<span className="text-ink-3">Choose a service</span>
					)}
				</Row>
				<Row label="Barber" onEdit={b.service ? () => onEdit(2) : undefined}>
					{who}
				</Row>
				<Row label="When" onEdit={at ? () => onEdit(2) : undefined}>
					{at ? (
						<>
							{longDate(at, b.timeZone)}
							<span className="block font-semibold">{timeLabel(at, b.timeZone)}</span>
						</>
					) : (
						<span className="text-ink-3">Pick a time</span>
					)}
				</Row>
				{lines.length ? (
					<Row label="Extras" onEdit={() => onEdit(3)}>
						<ul className="space-y-1">
							{lines.map((l) => (
								<li key={l.id} className="flex justify-between gap-2">
									<span className="min-w-0 truncate">
										{l.title}
										{l.quantity > 1 ? ` ×${l.quantity}` : ''}
									</span>
									<span className="tabular shrink-0">{money(l.total, currency)}</span>
								</li>
							))}
						</ul>
					</Row>
				) : null}
			</dl>
			<div className="border-t border-ink pt-3">
				{saving > 0 ? (
					<p className="flex justify-between text-sm text-green">
						<span>{siteConfig.shelf.autoCode} · 15% off the shelf</span>
						<span className="tabular">−{money(saving, currency)}</span>
					</p>
				) : null}
				<p className="mt-1 flex items-baseline justify-between">
					<span className="label text-ink-2">Total</span>
					<span className="display text-3xl">{money(total, currency)}</span>
				</p>
			</div>
			{hideAction ? null : (
				<button type="button" onClick={primary.onClick} disabled={primary.disabled || primary.busy} className="btn btn-primary btn-lg mt-4 w-full">
					{primary.busy ? 'Holding your chair…' : primary.label}
				</button>
			)}
			{secondary}
			{b.error && !b.lostSlot ? (
				<p role="alert" className="mt-3 text-sm text-oxblood">
					{b.error}
				</p>
			) : null}
			<p className="mt-3 text-center text-xs text-ink-3">Free to cancel up to 4 hours before.</p>
		</div>
	);
}
