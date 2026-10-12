import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

const HEADER_BAND = '#E8F4FC';
const HEADER_BAND_DARK = 'rgba(37, 99, 235, 0.22)';
const ACCENT = '#2563EB';
const ACCENT_DARK = '#93C5FD';

type SolarServiceOverlayModalProps = {
  visible: boolean;
  message: string;
  onCancel: () => void;
};

export function SolarServiceOverlayModal({
  visible,
  message,
  onCancel,
}: SolarServiceOverlayModalProps) {
  const { colors, isDark } = useAppTheme();
  const paragraphs = message
    .split('\n\n')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]} pointerEvents="box-none">
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityViewIsModal>
          <View
            style={[
              styles.header,
              { backgroundColor: isDark ? HEADER_BAND_DARK : HEADER_BAND },
            ]}>
            <Text style={[styles.title, { color: isDark ? ACCENT_DARK : ACCENT }]}>
              Wyre Data Delay Notification
            </Text>
          </View>
          <View style={styles.body}>
            {paragraphs.map((paragraph, index) => (
              <Text
                key={`${index}-${paragraph.slice(0, 24)}`}
                style={[styles.bodyText, { color: colors.textOnCard }]}>
                {paragraph}
              </Text>
            ))}
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              hitSlop={8}
              style={({ pressed }) => [styles.cancelHit, pressed && styles.pressed]}>
              <Text style={[styles.cancel, { color: isDark ? ACCENT_DARK : ACCENT }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  cancelHit: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cancel: {
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
});
