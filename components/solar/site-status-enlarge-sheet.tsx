import { StyleSheet, Text, View } from 'react-native';

import { AnimatedEnergyFlow } from '@/components/solar/animated-energy-flow';
import { siteStatusSentence } from '@/components/solar/site-status-card';
import { DetailSheet } from '@/components/wyre/detail-sheet';
import { useAppTheme } from '@/context/theme-context';
import { formatKw } from '@/lib/format';
import type { SolarSiteStatus } from '@/lib/solar-types';

type SiteStatusEnlargeSheetProps = {
  visible: boolean;
  onClose: () => void;
  data: SolarSiteStatus | null;
};

function FlowRow({
  label,
  detail,
  value,
}: {
  label: string;
  detail: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceMuted }]}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.textOnCard }]}>{label}</Text>
        <Text style={[styles.detail, { color: colors.textOnCardSecondary }]}>{detail}</Text>
      </View>
      <Text style={[styles.value, { color: colors.textOnCard }]}>{value}</Text>
    </View>
  );
}

function directionLabel(direction?: string): string {
  if (direction === 'IN') return 'Coming in';
  if (direction === 'OUT') return 'Going out';
  return 'Idle';
}

export function SiteStatusEnlargeSheet({ visible, onClose, data }: SiteStatusEnlargeSheetProps) {
  const { colors } = useAppTheme();
  if (!data) return null;

  return (
    <DetailSheet visible={visible} title="Live energy flow" onClose={onClose}>
      <Text style={[styles.sentence, { color: colors.textOnCard }]}>
        {siteStatusSentence(data)}
      </Text>
      <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
        Moving lines show the live direction of power.
      </Text>
      <View style={[styles.diagramCard, { backgroundColor: colors.surfaceMuted }]}>
        <AnimatedEnergyFlow data={data} />
      </View>
      <FlowRow
        label="Solar production"
        detail="Power from your panels right now"
        value={formatKw(data.pv.kw)}
      />
      <FlowRow
        label="Battery"
        detail={`${directionLabel(data.battery?.direction)} · ${Math.round(data.battery?.percentage ?? 0)}% full`}
        value={formatKw(data.battery?.kw)}
      />
      <FlowRow
        label="Home usage"
        detail="What the house is using now"
        value={formatKw(data.load.kw)}
      />
      <FlowRow
        label="Grid"
        detail={data.grid.status === 'ON' ? 'Connected' : 'Not supplying'}
        value={formatKw(data.grid.kw)}
      />
      {data.generator_power?.status === 'ON' ? (
        <FlowRow
          label="Generator"
          detail="Currently running"
          value={formatKw(data.generator_power.kw)}
        />
      ) : null}
    </DetailSheet>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: -8,
    fontSize: 12,
  },
  diagramCard: {
    borderRadius: 20,
    paddingTop: 8,
    overflow: 'hidden',
  },
  row: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  detail: {
    fontSize: 13,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
});
