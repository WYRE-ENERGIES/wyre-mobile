import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { Palettes, type AppPalette, type ThemeScheme } from '@/constants/theme';
import { getStoredThemeScheme, setStoredThemeScheme } from '@/config/storage';

type ThemeContextValue = {
  scheme: ThemeScheme;
  colors: AppPalette;
  isDark: boolean;
  ready: boolean;
  setScheme: (scheme: ThemeScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [scheme, setSchemeState] = useState<ThemeScheme>(systemScheme === 'dark' ? 'dark' : 'light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getStoredThemeScheme()
      .then((stored) => {
        if (cancelled) return;
        const next = stored ?? (systemScheme === 'dark' ? 'dark' : 'light');
        setSchemeState(next);
        Appearance.setColorScheme(next);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [systemScheme]);

  const setScheme = useCallback((next: ThemeScheme) => {
    setSchemeState(next);
    Appearance.setColorScheme(next);
    void setStoredThemeScheme(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: Palettes[scheme],
      isDark: scheme === 'dark',
      ready,
      setScheme,
    }),
    [scheme, ready, setScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return value;
}
