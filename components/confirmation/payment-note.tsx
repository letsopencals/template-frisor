import type { PaymentInstructions, PaymentProviderName } from '@opencals/storefront-sdk';
import { longDate, timeLabel } from '@/lib/when';

/** How the customer pays for an order placed without a card: what checkout submit returned, if we still have it. */
export interface PaymentInfo {
	/** Provider name of the chosen method (cash, bank_transfer, stripe_invoice, …). */
	provider: PaymentProviderName | null;
	instructions: PaymentInstructions | null;
	dueAt: string | null;
	/** Order number, the bank transfer reference. */
	reference: string | null;
}

function Row({ term, value }: { term: string; value: string | null | undefined }) {
	if (!value) return null;
	return (
		<div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-dashed border-paper-3 py-2 last:border-b-0">
			<dt className="label text-[0.6rem] text-ink-3">{term}</dt>
			<dd className="tabular break-all text-right font-semibold">{value}</dd>
		</div>
	);
}

const isHttps = (url: string | null | undefined): url is string => !!url && url.startsWith('https://');

/**
 * The "how to pay" slip on the thank-you page, keyed on the method: a bank transfer gets the account to pay
 * into, an invoice the link to pay it online, cash a note for the till. Without instructions (another tab,
 * storage cleared) it points to the email, never to the till.
 */
export function PaymentNote({ info, timeZone }: { info: PaymentInfo | null; timeZone: string }) {
	const provider = info?.instructions?.provider ?? info?.provider ?? null;
	const due = info?.dueAt ? new Date(info.dueAt).getTime() : null;
	const dueLine = due ? `Please pay by ${longDate(due, timeZone)}, ${timeLabel(due, timeZone)}. Unpaid bookings are released after that.` : null;
	const bank = info?.instructions?.bankDetails ?? null;
	const invoiceUrl = info?.instructions?.hostedInvoiceUrl;

	let title = 'How to pay';
	let body: React.ReactNode;
	if (provider === 'cash') {
		title = 'Pay at the shop';
		body = <p className="text-sm text-ink-2">Card or cash at the till, after your appointment.</p>;
	} else if (provider === 'stripe_invoice') {
		title = 'Pay your invoice';
		body = isHttps(invoiceUrl) ? (
			<>
				<p className="text-sm text-ink-2">Pay online by card or bank. We’ve emailed you the invoice too.</p>
				<a href={invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
					Pay invoice
				</a>
			</>
		) : (
			<p className="text-sm text-ink-2">Your invoice is on its way by email, with a link to pay it online.</p>
		);
	} else if (provider === 'bank_transfer') {
		title = 'Pay by bank transfer';
		body =
			bank && (bank.iban || bank.accountName) ? (
				<>
					<p className="text-sm text-ink-2">Transfer the total to this account. The same details are in your email.</p>
					<dl className="mt-3">
						<Row term="Account name" value={bank.accountName} />
						<Row term="Bank" value={bank.bankName} />
						<Row term="IBAN / account" value={bank.iban} />
						<Row term="SWIFT / BIC" value={bank.swift} />
						<Row term="Reference" value={info?.reference} />
					</dl>
				</>
			) : (
				<p className="text-sm text-ink-2">Check your email for our bank details{info?.reference ? `, and use ${info.reference} as the reference` : ''}.</p>
			);
	} else {
		body = <p className="text-sm text-ink-2">Check your email for the payment details.</p>;
	}

	return (
		<section aria-labelledby="pay-note" className="mt-6 border border-paper-3 bg-[#fbf8f2] p-5">
			<h2 id="pay-note" className="label text-brass-lo">
				{title}
			</h2>
			<div className="mt-2">{body}</div>
			{dueLine ? <p className="mt-3 text-sm font-semibold">{dueLine}</p> : null}
		</section>
	);
}
