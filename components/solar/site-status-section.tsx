import { FlowDiagram } from '@/components/solar/flow-diagram';
import type { SolarSiteStatus } from '@/lib/solar-types';

type SiteStatusSectionProps = {
  data: SolarSiteStatus;
};

export function SiteStatusSection({ data }: SiteStatusSectionProps) {
  return <FlowDiagram data={data} />;
}
