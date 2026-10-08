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
docs/           Technical scope and build plan
```

---

## Web reference

| Web | Mobile MVP |
|-----|------------|
| `wyre-dashboard` → `SolarOverviewPage.js` | Home screen |
| `/alerts-and-alarms` | Settings (operators) |
| 6 solar GET APIs | Same APIs |
| JWT + `branch_id` | Same auth model |
