import { Hero } from '@/components/home/hero';
import { StoryStrip } from '@/components/home/story-strip';
import { ServiceLedger } from '@/components/home/service-ledger';
import { LocationsStrip } from '@/components/home/locations-strip';
import { BarbersShowcase } from '@/components/home/barbers-showcase';
import { ProcessStrip } from '@/components/home/process-strip';
import { Lookbook } from '@/components/home/lookbook';
import { QuoteSlab } from '@/components/home/quote-slab';
import { EndRail } from '@/components/home/end-rail';

export default function HomePage() {
	return (
		<>
			<Hero />
			<StoryStrip />
			<ServiceLedger />
			<LocationsStrip />
			<BarbersShowcase />
			<ProcessStrip />
			<Lookbook />
			<QuoteSlab />
			<EndRail />
		</>
	);
}
