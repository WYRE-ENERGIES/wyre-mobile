import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedEnergyFlow } from '@/components/solar/animated-energy-flow';
import { useAppTheme } from '@/context/theme-context';
import type { SolarSiteStatus } from '@/lib/solar-types';

type SiteStatusCardProps = {
  data: SolarSiteStatus;
  onEnlarge: () => void;
};

export function siteStatusSentence(data: SolarSiteStatus): string {
  if (data.battery?.direction === 'IN') return 'Solar is charging your battery';
  if (data.generator_power?.status === 'ON') return 'Your generator is supplying power';
  if (data.grid?.status === 'ON' && (data.grid.kw ?? 0) > 0) return 'You are drawing power from the grid';
  if ((data.pv.kw ?? 0) > 0) return 'Your solar is powering the home';
  return 'Your system is resting right now';
}

export function SiteStatusCard({ data, onEnlarge }: SiteStatusCardProps) {
  const { colors, isDark } = useAppTheme();
  const linkColor = isDark ? '#A855F7' : colors.accent;
  const hasLiveFlow =
    (data.pv?.kw ?? 0) > 0 ||
    (data.load?.kw ?? 0) > 0 ||
    data.battery?.direction === 'IN' ||
    data.battery?.direction === 'OUT' ||
    (data.grid?.status === 'ON' && (data.grid?.kw ?? 0) > 0) ||
    data.generator_power?.status === 'ON';

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Site Status</Text>
        <Pressable onPress={onEnlarge} hitSlop={8}>
          <Text style={[styles.link, { color: linkColor }]}>View More</Text>
        </Pressable>
      </View>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
          },
        ]}>
        <View style={styles.cardHeader}>
          <View style={styles.sentenceWrap}>
            <Text style={[styles.sentence, { color: colors.textOnCard }]}>
              {siteStatusSentence(data)}
            </Text>
            <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
              Follow the moving lines to see where power is flowing.
            </Text>
          </View>
          <View
            style={[
              styles.livePill,
              {
                backgroundColor: hasLiveFlow
                  ? 'rgba(34,197,94,0.12)'
                  : colors.surfaceMuted,
              },
            ]}>
            <View
              style={[
                styles.liveDot,
                { backgroundColor: hasLiveFlow ? colors.success : colors.textOnCardSecondary },
              ]}
            />
            <Text
              style={[
                styles.liveText,
                { color: hasLiveFlow ? colors.success : colors.textOnCardSecondary },
              ]}>
              {hasLiveFlow ? 'Live' : 'Idle'}
            </Text>
          </View>
        </View>
        <AnimatedEnergyFlow data={data} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
  },
  sentenceWrap: {
    flex: 1,
    gap: 3,
  },
  sentence: {
    fontSize: 15,
    fontWeight: '800',
  },
  hint: {
    fontSize: 11,
    lineHeight: 16,
  },
  livePill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
