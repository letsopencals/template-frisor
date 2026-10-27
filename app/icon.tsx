import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Favicon: a brass Ø on bottle green. */
export default function Icon() {
	return new ImageResponse(
		<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a2f', color: '#d7b57a', fontSize: 24, fontFamily: 'Georgia, serif' }}>Ø</div>,
		size,
	);
}
