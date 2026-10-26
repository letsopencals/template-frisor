import { VisitDetail } from '@/components/account/visit-detail';

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <VisitDetail id={id} />;
}
