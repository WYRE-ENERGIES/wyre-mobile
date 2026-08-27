import { FeatureUnavailableState } from '@/components/wyre/feature-unavailable-state';

export function NoDieselAccess() {
  return (
    <FeatureUnavailableState
      icon="fuelpump.fill"
      eyebrow="SOLAR SITE"
      title="No generators connected"
      body="This site runs without a connected generator, so there’s no diesel usage, fuel cost, or runtime to report."
    />
  );
}
