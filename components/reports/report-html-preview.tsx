import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { WyreColors } from '@/constants/theme';

type ReportHtmlPreviewProps = {
  html: string;
  loading?: boolean;
  emptyMessage?: string;
};

export function ReportHtmlPreview({
  html,
  loading = false,
  emptyMessage = 'Select report parameters to load a preview.',
}: ReportHtmlPreviewProps) {
  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={WyreColors.purple} />
        <Text style={styles.stateText}>Loading preview…</Text>
      </View>
    );
  }

  if (!html) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>No preview yet</Text>
        <Text style={styles.stateText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        startInLoadingState
        scalesPageToFit
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: WyreColors.border,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  state: {
    minHeight: 220,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: WyreColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
});
