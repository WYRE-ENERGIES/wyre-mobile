import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

import { AppHeader } from '@/components/wyre/app-header';
import { WyreColors } from '@/constants/theme';

type AccountScreenProps = {
  title: string;
  children: ReactNode;
};

export function AccountScreen({ title, children }: AccountScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AppHeader
        rightAction={
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <MaterialIcons name="close" size={22} color={WyreColors.textPrimary} />
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
          <Text style={styles.title}>{title}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WyreColors.pageBg,
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
    color: WyreColors.textPrimary,
    marginBottom: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WyreColors.pageBg,
  },
  pressed: {
    opacity: 0.7,
  },
});
