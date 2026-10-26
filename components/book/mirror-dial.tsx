'use client';

import { useId } from 'react';
import type { Start } from '@/lib/slots';
import { localMinutes, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';

/**
 * The Mirror Dial (DESIGN.md "Booking interaction"): the station mirror with the day's free
 * times as brass notches around its rim, opening hour to closing hour over 300°. The hand turns
 * to the chosen time. Decorative for assistive tech: the time list under it is the real control.
 */
const SIZE = 420;
const C = SIZE / 2;
const SWEEP = 300;
const START_DEG = -150;

function hoursFor(day: string | null): [number, number] {
	if (!day) return [600, 1200];
	const wd = new Date(`${day}T12:00:00Z`).getUTCDay() || 7;
	const h = siteConfig.hours[wd];
	if (!h) return [600, 1200];
	const m = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
	return [m(h[0]), m(h[1])];
}

const polar = (deg: number, r: number) => {
	const rad = ((deg - 90) * Math.PI) / 180;
	return [C + r * Math.cos(rad), C + r * Math.sin(rad)] as const;
};

export function MirrorDial({ day, starts, selected, onPick, portrait, caption }: { day: string | null; starts: Start[]; selected: number | null; onPick: (at: number) => void; portrait: string | null; caption: string }) {
	const clip = useId();
	const tz = siteConfig.timeZone;
	const [open, close] = hoursFor(day);
	const angleOf = (mins: number) => START_DEG + (Math.min(Math.max(mins, open), close) - open) * (SWEEP / Math.max(60, close - open));
	const hours: number[] = [];
	for (let h = Math.ceil(open / 60); h * 60 <= close; h++) hours.push(h);
	const handDeg = selected != null ? angleOf(localMinutes(selected, tz)) : START_DEG;

	return (
		<div className="relative mx-auto w-full max-w-[420px]" aria-hidden>
			<svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full">
				<defs>
					<linearGradient id={`${clip}-brass`} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#e7cb8e" />
						<stop offset="0.45" stopColor="#c49a58" />
						<stop offset="0.7" stopColor="#6d4f24" />
						<stop offset="1" stopColor="#e7cb8e" />
					</linearGradient>
					<clipPath id={`${clip}-glass`}>
						<circle cx={C} cy={C} r={128} />
					</clipPath>
					<radialGradient id={`${clip}-sheen`} cx="0.35" cy="0.3" r="0.8">
						<stop offset="0" stopColor="#fff" stopOpacity="0.16" />
						<stop offset="0.5" stopColor="#fff" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* Brass bezel and the dark face the notches sit on */}
				<circle cx={C} cy={C} r={204} fill={`url(#${clip}-brass)`} />
				<circle cx={C} cy={C} r={196} fill="#121917" />
				<circle cx={C} cy={C} r={140} fill={`url(#${clip}-brass)`} />

				{/* Hour marks */}
				{hours.map((h) => {
					const a = angleOf(h * 60);
					const [x1, y1] = polar(a, 192);
					const [x2, y2] = polar(a, 180);
					const [lx, ly] = polar(a, 158);
					return (
						<g key={h}>
							<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c49a58" strokeWidth={2} />
							<text x={lx} y={ly + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#97a39e" style={{ fontFamily: 'var(--font-sign)' }}>
								{String(h).padStart(2, '0')}
							</text>
						</g>
					);
				})}

				{/* Free times as notches; tap one to choose it */}
				{starts.map((s) => {
					const a = angleOf(localMinutes(s.at, tz));
					const [x1, y1] = polar(a, 190);
					const [x2, y2] = polar(a, 170);
					const on = s.at === selected;
					return (
						<g key={s.at} className="cursor-pointer" onClick={() => onPick(s.at)}>
							<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={14} />
							<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? '#f2ece0' : '#e7cb8e'} strokeWidth={on ? 6 : 3.5} strokeLinecap="round" opacity={on ? 1 : 0.9} />
						</g>
					);
				})}

				{/* The glass: barber portrait or the shop */}
				<g clipPath={`url(#${clip}-glass)`}>
					<rect x={C - 128} y={C - 128} width={256} height={256} fill="#1f2a27" />
					{portrait ? <image href={portrait} x={C - 128} y={C - 128} width={256} height={256} preserveAspectRatio="xMidYMid slice" opacity={0.92} /> : null}
					<rect x={C - 128} y={C - 128} width={256} height={256} fill={`url(#${clip}-sheen)`} />
				</g>

				{/* The hand */}
				<g className="dial-hand" style={{ transform: `rotate(${handDeg}deg)` }}>
					<line x1={C} y1={C} x2={C} y2={C - 186} stroke="#c49a58" strokeWidth={3} strokeLinecap="round" opacity={selected != null ? 1 : 0.35} />
					<circle cx={C} cy={C - 186} r={5} fill="#e7cb8e" opacity={selected != null ? 1 : 0} />
				</g>
				<circle cx={C} cy={C} r={9} fill={`url(#${clip}-brass)`} stroke="#121917" strokeWidth={2} />
			</svg>
			<div className="pointer-events-none absolute inset-x-0 bottom-[13%] text-center">
				<span className="paper inline-block px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] shadow-lg">{selected != null ? timeLabel(selected, tz) : caption}</span>
			</div>
		</div>
	);
}
