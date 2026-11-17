import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useAppTheme } from '@/context/theme-context';

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
  const { colors } = useAppTheme();
  if (loading) {
    return (
      <View style={[styles.state, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={[styles.stateText, { color: colors.textOnCardSecondary }]}>Loading preview…</Text>
      </View>
    );
  }

  if (!html) {
    return (
      <View style={[styles.state, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.stateTitle, { color: colors.textOnCard }]}>No preview yet</Text>
        <Text style={[styles.stateText, { color: colors.textOnCardSecondary }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.frame, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {Platform.OS === 'web' ? (
        // react-native-webview has no web support; render the report in a sandboxed iframe.
        <iframe
          title="Report preview"
          srcDoc={html}
          sandbox="allow-scripts allow-popups"
          style={{ flex: 1, width: '100%', height: '100%', border: 0, backgroundColor: colors.surface }}
        />
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={[styles.webview, { backgroundColor: colors.surface }]}
          startInLoadingState
          scalesPageToFit
          setSupportMultipleWindows={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  state: {
    minHeight: 220,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
