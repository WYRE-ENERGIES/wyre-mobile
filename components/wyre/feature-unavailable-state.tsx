import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';

type FeatureUnavailableStateProps = {
  icon: 'sun.max.fill' | 'fuelpump.fill';
  eyebrow: string;
  title: string;
  body: string;
};

export function FeatureUnavailableState({
  icon,
  eyebrow,
  title,
  body,
}: FeatureUnavailableStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.screen}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconOuter, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.accentMuted }]}>
            <IconSymbol name={icon} size={30} color={colors.accent} />
          </View>
        </View>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
        <Text style={[styles.title, { color: colors.textOnCard }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textOnCardSecondary }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  card: {
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
  },
  iconOuter: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    marginTop: 9,
    maxWidth: 310,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
