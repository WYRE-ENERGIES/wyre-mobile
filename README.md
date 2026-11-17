# Wyre Mobile App

The native iOS and Android app for the **Wyre Solar Dashboard**. It brings the web solar monitoring experience to mobile.

Built with Expo SDK 54 · React Native 0.81 · TypeScript · Expo Router · Redux Toolkit · Firebase Cloud Messaging (push notifications)

- **Technical scope & build plan:** [docs/TECHNICAL.md](./docs/TECHNICAL.md)
- **iOS bundle ID / Android package:** `com.wyreng.ems`

---

## 1. Prerequisites

Install these before you start.

| Tool | Version | Needed for |
|------|---------|------------|
| [Node.js](https://nodejs.org/) | **20.19+** (LTS 22 recommended) | Everything |
| npm | Comes with Node | Everything |
| Git | Any recent | Everything |
| [Xcode](https://apps.apple.com/app/xcode/id497799835) | **16.1+** (Xcode 26 works too) | iOS (macOS only) |
| [CocoaPods](https://cocoapods.org/) | 1.15+ (`brew install cocoapods`) | iOS |
| [Watchman](https://facebook.github.io/watchman/) | Optional, recommended (`brew install watchman`) | Faster reloads on macOS |
| [Android Studio](https://developer.android.com/studio) | Latest stable, with Android SDK 36 + an emulator | Android |
| JDK | **17** (the one bundled with Android Studio is fine) | Android |

**iOS only:** after installing Xcode, open it once to accept the licence and install an iOS Simulator. Then run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**Android only:** add the SDK to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
# export ANDROID_HOME=$HOME/Android/Sdk              # Linux
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

If you use Android Studio's bundled JDK, also set `JAVA_HOME`:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

Check your setup with `node -v`, `pod --version`, `adb --version` and `java -version`.

---

## 2. Get the code

```bash
git clone https://github.com/WYRE-ENERGIES/wyre-mobile.git
cd wyre-mobile
npm install
```

---

## 3. Add the Firebase config files (required)

The app uses Firebase for push notifications. Its two Firebase config files are **not committed to GitHub** (they are in `.gitignore`), so every developer has to add them locally.

| File | Platform | Where it goes |
|------|----------|---------------|
| `google-services.json` | Android | Project root, next to `app.json` |
| `GoogleService-Info.plist` | iOS | Project root, next to `app.json` |

How to get them:

- Ask a team lead to share them privately, **or**
- If you have access to the Wyre Firebase project, download them from the [Firebase console](https://console.firebase.google.com/): **Project settings → General → Your apps**. Pick the iOS app or Android app registered as `com.wyreng.ems`.

Your project root should then look like this:

```
wyre-mobile/
├── app.json
├── google-services.json        ← Android
├── GoogleService-Info.plist    ← iOS
├── package.json
└── ...
```

> ⚠️ **Never commit these files.** If `git status` lists either of them, do not add them to a commit.

The iOS or Android build will fail if a file is missing or in the wrong place.

---

## 4. Environment variables (optional)

The API URLs default to production (`https://backend.wyreng.com/`), so the app runs without a `.env` file. To point it at another backend, copy the example file and edit it:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_URL=https://backend.wyreng.com/api/v1/
EXPO_PUBLIC_API_BASE_URL=https://backend.wyreng.com/
```

Restart Metro with `npx expo start -c` after changing `.env`.

---

## 5. Run the app

The `ios/` and `android/` folders are **generated** from `app.json` and are not committed. The first `npm run ios` or `npm run android` creates them automatically (this is Expo "prebuild"), so the first build takes a few minutes. Later builds are much faster.

### iOS (macOS only)

```bash
npm run ios                     # build and open in the default iOS Simulator
npx expo run:ios --device       # pick a connected iPhone instead
```

To run on a physical iPhone, open `ios/Wyre.xcworkspace` in Xcode once. Under **Signing & Capabilities**, select your Apple developer team, then run the command above.

### Android

Start an emulator from Android Studio (**Device Manager**), or plug in a phone with USB debugging enabled. Then run:

```bash
npm run android                 # build and install on the running emulator/device
npx expo run:android --device   # pick a specific device
```

### Day-to-day development

You only need to rebuild the native app when native code or config changes (see section 6). Otherwise, keep the installed app and just start Metro:

```bash
npm start                       # start the Metro bundler
```

Then open the Wyre app on your simulator or emulator. In the Metro terminal, press `i` (iOS) or `a` (Android) to open it, `r` to reload, or `m` for the dev menu.

### Expo Go (UI preview only)

You can run `npm start` and scan the QR code with the Expo Go app for quick UI checks. **Push notifications and Firebase do not work in Expo Go.** Use a native build (`npm run ios` / `npm run android`) for full functionality.

---

## 6. When to rebuild / prebuild

Run a **clean prebuild** whenever you:

- pull changes to `app.json`, `plugins/`, or native dependencies in `package.json`,
- change the app icon, splash screen or Firebase files,
- hit strange native build errors.

```bash
npx expo prebuild --clean       # regenerate ios/ and android/ from app.json
npm run ios                     # or: npm run android
```

---

## 7. Useful commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install JS dependencies |
| `npm start` | Start Metro bundler |
| `npx expo start -c` | Start Metro with a cleared cache |
| `npm run ios` | Build and run on the iOS Simulator |
| `npm run android` | Build and run on an Android emulator/device |
| `npx expo run:ios --device` | Run on a physical iPhone |
| `npx expo run:android --device` | Run on a specific Android device |
| `npx expo prebuild --clean` | Regenerate the native `ios/` and `android/` folders |
| `npx expo install <package>` | Add a package at the version compatible with SDK 54 |
| `npx expo-doctor` | Check the project for config/dependency problems |
| `npm run lint` | Run ESLint |
| `npm run build:apk` | Shareable Android APK on EAS (section 10) |
| `npm run build:apk:local` | Android release APK built on your Mac (section 10) |
| `npm run web` | Run the PWA in the browser (dev) |
| `npm run build:web` | Production web build + service worker into `dist/` (section 11) |
| `npm run preview:web` | Serve `dist/` locally at http://localhost:4173 |

---

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails mentioning `GoogleService-Info.plist` or `google-services.json` | The Firebase file is missing or not in the project root. See section 3. |
| iOS: `pod install` errors | Run `cd ios && pod install --repo-update && cd ..`, or `npx expo prebuild --clean` |
| iOS: signing error on a real device | Open `ios/Wyre.xcworkspace` in Xcode and set your team under **Signing & Capabilities** |
| Android: `SDK location not found` | Set `ANDROID_HOME` (section 1), or create `android/local.properties` with `sdk.dir=/path/to/Android/sdk` |
| Android: wrong Java version | Use JDK 17 and set `JAVA_HOME` (section 1) |
| Android: `No connected devices` | Start an emulator in Android Studio first, and check `adb devices` |
| Red screen / stale code | `npx expo start -c` |
| App icon didn't update | Run `npx expo prebuild --clean`, then uninstall and reinstall the app (phones cache icons) |
| Push notifications not arriving | Test on a **physical device** with a native build. Expo Go and most simulators can't receive FCM push. |

---

## 9. Project structure

```
app/            Screens and navigation (Expo Router, file-based routes)
components/     Reusable UI components
config/         Env config (EnvData.ts), API clients, storage helpers
constants/      Theme colours, fonts, constants
context/        React context providers
hooks/          Custom hooks
lib/            Push notifications, API helpers, utilities
redux/          Redux Toolkit store and slices
plugins/        Custom Expo config plugins (iOS Podfile fixes for Firebase/Xcode)
assets/         Images, branding, app icons
docs/           Technical scope, build plan, PWA push plan
public/         Web-only static files: manifest, PWA icons, favicon, offline page
web/            Service worker template (web only)
scripts/        Web build helpers (service worker generator, local dist server, icon generator)
```

Platform-specific files: `Component.web.tsx` is used on web, `Component.tsx` on iOS/Android.
The web-only pieces are `app/+html.tsx`, `components/web/pwa-support.web.tsx`,
`components/ui/date-time-picker.web.tsx` and `lib/web-polyfills.web.ts`.

---

## 10. Android APK (EAS)

The `preview` profile in `eas.json` builds a plain `.apk` you can share with a link. No Play Store needed.

| Profile | Output | Use |
|---------|--------|-----|
| `development` | Debug APK (needs Metro running) | Team debug builds |
| `preview` | Release APK, internal distribution | **Shareable APK for testers** |
| `production` | App Bundle (`.aab`), version auto-increment | Play Store, later |

Version numbers are managed by EAS (`cli.appVersionSource: "remote"`).

### One-time setup

Install the EAS CLI globally (it is not a project dependency):

```bash
npm install -g eas-cli
```

```bash
eas login
```

The project is already linked (`extra.eas.projectId` in `app.json`, owner `ejehameh`). You only need `eas init` if you are setting up a fresh EAS project:

```bash
eas init
```

The Firebase files are gitignored, so EAS cloud builds can't see them. They are stored as **secret file environment variables** and `app.config.js` points `googleServicesFile` at them on EAS (locally it still uses the files in the project root). These have already been created for this project. To recreate or update them, run from the project root:

```bash
eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret --environment preview --environment production --environment development
```

```bash
eas env:create --name GOOGLE_SERVICE_INFO_PLIST --type file --value ./GoogleService-Info.plist --visibility secret --environment preview --environment production --environment development
```

(Newer EAS CLI versions call this `eas env:set`; to replace an existing value use `eas env:update`.)

If you need a non-default API URL in a build, add `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_API_BASE_URL` as plain-text EAS environment variables. `.env` is not uploaded.

### Build and share

```bash
npm run build:apk
```

This runs `eas build -p android --profile preview`. When it finishes, EAS prints a build page link (also listed at expo.dev → Projects → wyre-app → Builds). The build page has an **Install** button and a QR code. Send that link to testers.

### Installing on a tester's phone

1. Open the link on the Android phone and tap **Install** (or download the `.apk`).
2. When Android asks, allow your browser/Files app to **Install unknown apps** (Settings → Apps → Chrome → Install unknown apps → Allow).
3. Open the downloaded APK and tap **Install**. Play Protect may warn that the app is from an unknown developer; tap **Install anyway**.
4. Open Wyre and allow notifications when asked (Android 13+).

### Local build (free fallback)

No EAS account or queue needed. Requires the Android setup from section 1 and `google-services.json` in the project root.

```bash
npm run build:apk:local
```

This runs `expo prebuild -p android` and then `./gradlew assembleRelease`. The APK is written to:

```
android/app/build/outputs/apk/release/app-release.apk
```

Note: local release builds are signed with the debug keystore from the generated project. That's fine for sideloading to testers, but not for the Play Store. EAS builds use the keystore EAS manages for this project.

### Push notifications on Android

- `google-services.json` is included in both EAS and local builds.
- On Android 13+ the app asks for the `POST_NOTIFICATIONS` permission (the permission comes from `expo-notifications`; the prompt is shown when push is registered after login).
- The `wyre-alerts` channel is created before the FCM token is fetched, and `firebase.json` makes it FCM's default channel for background notifications.

---

## 11. PWA (web)

The same codebase runs in the browser as an installable Progressive Web App, which is mainly for iPhone users until TestFlight is ready. Native iOS/Android builds are unaffected.

### Run (development)

```bash
npm run web
```

Opens at http://localhost:8081. The service worker is **not** registered in development.

### Build and preview

```bash
npm run build:web
```

This runs `expo export -p web` (static output into `dist/`), then generates `dist/sw.js`.

```bash
npm run preview:web
```

This serves `dist/` at http://localhost:4173 with the same SPA fallback as production. localhost counts as secure, so the service worker and install prompt work there.

### Deploy

`dist/` is plain static files. Every route must fall back to `index.html`, because the app is a single-page app behind login.

- **Vercel**: `vercel.json` is included (build command, output dir, SPA rewrite, `sw.js` no-cache). Import the repo and deploy.
- **Netlify**: `netlify.toml` is included (same settings).
- **Firebase Hosting**: set `"public": "dist"`, add a rewrite `{"source": "**", "destination": "/index.html"}`, and a `Cache-Control: no-cache` header for `/sw.js`. Run `npm run build:web` before `firebase deploy`.
- Any host must serve over **HTTPS** (required for install and the service worker).

**CORS:** the browser calls `https://backend.wyreng.com` directly from the PWA's domain. The backend must allow that origin (`Access-Control-Allow-Origin`, plus `Authorization` and `Content-Type` in `Access-Control-Allow-Headers`, and preflight `OPTIONS`). Add the production PWA domain to the backend's CORS allow-list before launch.

### Install on a phone

- **iPhone (Safari):** open the site in Safari → tap **Share** → **Add to Home Screen** → **Add**. It opens full screen like an app. (It must be Safari; other browsers on iOS 16.3 and older can't install.)
- **Android (Chrome):** open the site → tap the **Install app** banner, or ⋮ menu → **Install app** / **Add to Home screen**.
- **Desktop Chrome/Edge:** click the install icon in the address bar. On wide screens the app is shown as a centred phone-sized column.

### How the PWA behaves

- **Offline:** if the network is unreachable when the app is opened, a "You're offline" page is shown (with a retry). While the app is open, a banner appears when the connection drops.
- **Data is always live:** API calls are never cached by the service worker, so stale data or sessions are never served.
- **Updates:** a new deploy installs in the background and is used on the next launch. If the app is open, a "New version available → Refresh" bar appears.
- **Sign-in:** tokens are stored in the browser's `localStorage` (via AsyncStorage's web implementation), so users stay signed in between launches.

### Differences from the native app

- **No push notifications yet** (the push toggle and device notification settings are hidden on web). See [docs/PWA_PUSH_PLAN.md](./docs/PWA_PUSH_PLAN.md).
- Tabs use the standard tab bar (iOS native uses the system "liquid glass" tab bar).
- Date/time pickers use the browser's own date and time inputs. The report preview is an `<iframe>` instead of a WebView. Icons use Material icons instead of SF Symbols. Confirmation dialogs use the browser's `confirm()`/`alert()`.
- No haptics.

### PWA icons

Icons in `public/` were generated from `assets/branding/wyre-app-icon.svg`. To regenerate them (macOS):

```bash
sh scripts/generate-pwa-icons.sh
```

---

## Web reference

| Web | Mobile MVP |
|-----|------------|
| `wyre-dashboard` → `SolarOverviewPage.js` | Home screen |
| `/alerts-and-alarms` | Settings (operators) |
| 6 solar GET APIs | Same APIs |
| JWT + `branch_id` | Same auth model |
