import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	async redirects() {
		return [
			{ source: '/menu', destination: '/services', permanent: true },
			{ source: '/apothecary', destination: '/shelf', permanent: true },
			// Older account paths still used by emailed links.
			{ source: '/account/appointments', destination: '/account', permanent: false },
			{ source: '/account/appointments/:id', destination: '/account/visits/:id', permanent: false },
			{ source: '/account/settings', destination: '/account/profile', permanent: false },
			{ source: '/account/orders/:id', destination: '/account/orders', permanent: false },
		];
	},
	images: {
		// Serve images as-is. Vercel's Image Optimization has a monthly quota (Hobby: 5,000
		// transformations), and once it's used up every new image returns 402 and renders blank.
		// The files in public/ are already web-sized; remove this line to re-enable optimization.
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.opencals.com',
			},
			{
				protocol: 'https',
				hostname: '*.amazonaws.com',
			},
		],
	},
};

export default nextConfig;
