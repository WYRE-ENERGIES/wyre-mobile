import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WyreColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import type { AlertSeverity } from '@/lib/alerts';
import type { NotificationViewModel } from '@/lib/notification-presentation';

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: WyreColors.error,
  warning: WyreColors.warning,
  info: WyreColors.purple,
  success: WyreColors.success,
};

type NotificationDetailViewProps = {
  model: NotificationViewModel;
};

export function NotificationDetailView({ model }: NotificationDetailViewProps) {
  const { colors } = useAppTheme();
  const accent = SEVERITY_COLOR[model.severity];

  return (
    <View style={styles.wrap}>
      <View style={styles.meta}>
        <View style={[styles.chip, { backgroundColor: colors.surface }]}>
          <IconSymbol name={model.icon} size={16} color={accent} />
          <Text style={[styles.chipText, { color: colors.textOnCard }]}>{model.categoryLabel}</Text>
        </View>
        <Text style={[styles.metaText, { color: colors.textOnPageMuted }]}>{model.branchName}</Text>
        {model.timeLabel ? (
          <Text style={[styles.metaText, { color: colors.textOnPageMuted }]}>{model.timeLabel}</Text>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.type, { color: colors.textOnCardSecondary }]}>{model.typeLabel}</Text>
        {model.hero ? (
          <View style={styles.hero}>
            <View style={styles.heroValueRow}>
              <Text style={[styles.heroValue, { color: accent }]}>{model.hero.value}</Text>
              {model.hero.unit ? (
                <Text style={[styles.heroUnit, { color: colors.textOnCardSecondary }]}>
                  {model.hero.unit}
                </Text>
              ) : null}
            </View>
            {model.hero.caption ? (
              <Text style={[styles.heroCaption, { color: colors.textOnCardSecondary }]}>
                {model.hero.caption}
              </Text>
            ) : null}
            {model.hero.progress != null ? (
              <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.round(model.hero.progress * 100)}%`, backgroundColor: accent },
                  ]}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={[styles.body, { color: colors.textOnCard }]}>{model.body}</Text>
      </View>

      {model.facts.length > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {model.facts.map((fact, index) => (
            <View
              key={fact.label}
              style={[
                styles.factRow,
                index < model.facts.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}>
              <Text style={[styles.factLabel, { color: colors.textOnCardSecondary }]}>
                {fact.label}
              </Text>
              <Text style={[styles.factValue, { color: colors.textOnCard }]}>{fact.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {model.cta ? (
        <AuthButton
          title={model.cta.label}
          onPress={() =>
            router.replace(
              model.cta!.params
                ? { pathname: model.cta!.route, params: model.cta!.params }
                : model.cta!.route,
            )
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  meta: {
    gap: 6,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 13,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  type: {
    fontSize: 13,
    fontWeight: '600',
  },
  hero: {
    gap: 6,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 6,
  },
  heroCaption: {
    fontSize: 14,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  factLabel: {
    fontSize: 13,
    flex: 1,
  },
  factValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '58%',
  },
});
