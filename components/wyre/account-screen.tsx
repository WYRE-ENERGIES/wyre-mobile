import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppHeader } from '@/components/wyre/app-header';
import { useAppTheme } from '@/context/theme-context';

type AccountScreenProps = {
  title: string;
  children: ReactNode;
  showWordmark?: boolean;
  titleInHeader?: boolean;
};

export function AccountScreen({
  title,
  children,
  showWordmark = true,
  titleInHeader = false,
}: AccountScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.pageBg }]}>
      <AppHeader
        showWordmark={showWordmark}
        leftContent={
          titleInHeader ? (
            <Text style={[styles.headerTitle, { color: colors.textOnPage }]}>{title}</Text>
          ) : undefined
        }
        rightAction={
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: colors.surfaceMuted },
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <IconSymbol name="xmark" size={22} color={colors.textOnPage} />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!titleInHeader ? (
            <Text style={[styles.title, { color: colors.textOnPage }]}>{title}</Text>
          ) : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
