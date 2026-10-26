import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getProducts } from '@/lib/server-data';
import { studioAvailability } from '@/lib/availability-server';

/**
 * GET /api/availability/studio?variant=<variantId>&location=<locationId>
 *
 * Every clinician's free windows for one treatment at one studio, across the
 * whole booking horizon (cached 60 s per clinician, see lib/availability-server).
 * The browser derives the day strip, times, "next free" and "sooner nearby" from
 * this, so there is exactly one request per (treatment, studio).
 */
export async function GET(request: NextRequest) {
	const variantId = request.nextUrl.searchParams.get('variant');
	const locationId = request.nextUrl.searchParams.get('location');
	if (!variantId || !locationId) return NextResponse.json({ error: 'variant and location are required' }, { status: 400 });

	try {
		const variant = (await getProducts()).flatMap((p) => p.variants ?? []).find((v) => v.id === variantId);
		if (!variant) return NextResponse.json({ error: 'Unknown treatment' }, { status: 404 });
		const location = (variant.locations ?? []).find((l) => l.id === locationId);
		if (!location) return NextResponse.json({ error: 'Not offered at this studio' }, { status: 404 });

		// Clinicians who do this treatment AND work at this studio.
		const here = new Set((location.staffMembers ?? []).map((s) => s.id));
		const staffIds = (variant.staffMembers ?? []).map((s) => s.id).filter((id) => here.size === 0 || here.has(id));

		const data = await studioAvailability(variant.id, location.id, staffIds, variant.duration);
		return NextResponse.json(data, { headers: { 'Cache-Control': 'private, max-age=30' } });
	} catch (err) {
		return handleApiError(err);
	}
}
