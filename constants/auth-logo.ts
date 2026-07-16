/** Shared Wyre wordmark sizes for splash ↔ login handoff animation. */
export const AUTH_LOGO = {
  /** Final size on the login header */
  finalWidth: 96,
  finalHeight: 38,
  /** Starting size matching the splash screen wordmark */
  splashWidth: 168,
  splashHeight: 66,
  /** Padding below the status bar for the login logo row */
  headerOffset: 10,
  source: require('@/assets/branding/wyre-logo-full.png') as number,
} as const;
