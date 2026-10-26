import { VisitDetail } from '@/components/account/visit-detail';

export default async function VisitPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ action?: string }> }) {
	const [{ id }, { action }] = await Promise.all([params, searchParams]);
	return <VisitDetail id={id} action={action ?? null} />;
}
