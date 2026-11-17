import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web only: the HTML shell for every statically exported page.
 * Native apps never use this file.
 *
 * - PWA metadata (manifest, theme-color, Apple standalone tags, icons).
 * - viewport-fit=cover so the installed iOS app draws edge to edge; the app's
 *   screens already pad for the notch / home indicator through
 *   react-native-safe-area-context, which reads env(safe-area-inset-*) on web.
 * - On wide screens the app is centred in a phone-sized column (max 480px).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Monitor your solar, diesel and energy usage with Wyre." />

        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#F4F2F8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#05010A" media="(prefers-color-scheme: dark)" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wyre" />
        <meta name="application-name" content="Wyre" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />

        {/* Disables body scrolling on web so ScrollView behaves like native. */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: shellStyles }} />
      </head>
      <body>
        <noscript>Wyre needs JavaScript enabled to run.</noscript>
        {children}
      </body>
    </html>
  );
}

const shellStyles = `
:root { color-scheme: light dark; }
html, body { background-color: #E9E4F1; }
@media (prefers-color-scheme: dark) {
  html, body { background-color: #000000; }
}
body {
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  box-sizing: border-box;
}
#root {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
  background-color: #F4F2F8;
}
@media (prefers-color-scheme: dark) {
  #root { background-color: #05010A; }
}
/* iOS Safari zooms into inputs smaller than 16px; keep the zoom level stable. */
@supports (-webkit-touch-callout: none) {
  input, textarea, select { font-size: 16px !important; }
}
/* Desktop: show the app as a centred phone-sized column. */
@media (min-width: 520px) {
  #root { box-shadow: 0 0 0 1px rgba(17, 24, 39, 0.06), 0 24px 64px rgba(17, 24, 39, 0.18); }
  /* react-native-web Modals portal to <body>; keep their sheets inside the column. */
  [aria-modal="true"] {
    left: 50% !important;
    right: auto !important;
    width: 100% !important;
    max-width: 480px !important;
    transform: translateX(-50%);
  }
}
`;
