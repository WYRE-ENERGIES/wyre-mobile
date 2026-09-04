import { FeatureUnavailableState } from '@/components/wyre/feature-unavailable-state';

export function NoSolarAccess() {
  return (
    <FeatureUnavailableState
      icon="sun.max.fill"
      eyebrow="EMS ACCOUNT"
      title="Solar monitoring isn’t available"
      body="This site uses Wyre EMS without a connected solar system. Your diesel and energy-management tools are still available."
    />
  );
}
