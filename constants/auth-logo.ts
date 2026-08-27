/** Shared Wyre wordmark sizes for splash ↔ login handoff animation. */
export const AUTH_LOGO = {
  /** Final size on the login / welcome header */
  finalWidth: 100,
  finalHeight: 40,
  /** Starting size matching the splash screen wordmark */
  splashWidth: 168,
  splashHeight: 66,
  /** Padding below the status bar for the login logo row */
  headerOffset: 8,
  source: require('@/assets/branding/wyre-logo.png') as number,
  sourceDark: require('@/assets/branding/wyre-logo-white.png') as number,
} as const;
