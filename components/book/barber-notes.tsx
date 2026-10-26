'use client';

import { questionDescription, questionOptions, questionTitle } from '@/hooks/use-checkout-questions';
import type { ChairBooking } from '@/hooks/use-chair-booking';

const FIELD = 'w-full border border-line bg-lacquer px-3 py-2.5 text-sm text-towel placeholder:text-steel-2 focus:border-brass focus:outline-none';

/** The store's questions for this service, as a note to your barber. File uploads are skipped. */
export function BarberNotes({ b }: { b: ChairBooking }) {
	const qs = b.questions.filter((q) => q.type !== 'file-upload' && q.type !== 'rating');
	if (!qs.length) return null;
	return (
		<div>
			<p className="label text-brass">A note for {b.barber?.firstName ?? 'your barber'}</p>
			<div className="mt-3 space-y-4">
				{qs.map((q) => {
					const id = `q-${q.id}`;
					const value = b.answers[q.id] ?? '';
					const title = `${questionTitle(q)}${q.required ? ' *' : ''}`;
					const help = questionDescription(q);
					if (q.type === 'checkbox') {
						return (
							<label key={q.id} className="flex items-start gap-3 text-sm text-towel/85">
								<input type="checkbox" checked={value === 'Yes'} onChange={(e) => b.setAnswer(q.id, e.target.checked ? 'Yes' : '')} className="mt-0.5 h-4 w-4 accent-[#c49a58]" />
								<span>{title}</span>
							</label>
						);
					}
					return (
						<div key={q.id}>
							<label htmlFor={id} className="block text-sm text-towel">
								{title}
							</label>
							{help ? <p className="mt-0.5 text-xs text-steel">{help}</p> : null}
							<div className="mt-1.5">
								{q.type === 'dropdown' ? (
									<select id={id} value={value} onChange={(e) => b.setAnswer(q.id, e.target.value)} className={FIELD}>
										<option value="">Choose…</option>
										{questionOptions(q).map((o) => (
											<option key={o}>{o}</option>
										))}
									</select>
								) : q.type === 'multi-line-text-field' ? (
									<textarea id={id} rows={2} value={value} onChange={(e) => b.setAnswer(q.id, e.target.value)} className={FIELD} />
								) : (
									<input id={id} value={value} onChange={(e) => b.setAnswer(q.id, e.target.value)} className={FIELD} />
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
