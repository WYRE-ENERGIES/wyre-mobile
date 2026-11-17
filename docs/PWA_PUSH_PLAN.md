# PWA web push: plan (not implemented)

Status: **plan only**. The PWA currently has no push notifications. The push toggle and the device notification settings rows are hidden on web (`app/settings.tsx`), and `lib/push-notifications.ts` / `lib/push-api.ts` return early on web.

This document covers what it would take to deliver the same Wyre alerts to the installed PWA, mainly for iPhone users until the native iOS app ships.

---

## 1. How it would work

```
Backend alert ──► FCM HTTP v1 (same Firebase project) ──► Web Push (VAPID)
                                                         ├─► Chrome / Edge / Firefox (Android + desktop)
                                                         └─► Safari / iOS home-screen web app (iOS 16.4+)
```

We already send Android pushes through FCM. FCM also delivers to browsers using the standard Web Push protocol, so the backend can keep one sending path. Web tokens are just another device type.

---

## 2. Client (this repo)

### 2.1 Firebase setup

1. In the Firebase console → Project settings → **Your apps**, add a **Web app** (e.g. "Wyre PWA"). Copy its config (`apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`). These values are public by design. Put them in `EXPO_PUBLIC_FIREBASE_*` env vars, read through `config/EnvData.ts`.
2. Project settings → **Cloud Messaging** → **Web Push certificates** → **Generate key pair**. This is the **VAPID public key** (`EXPO_PUBLIC_FIREBASE_VAPID_KEY`). The private half stays in Firebase.

### 2.2 Dependency

- `npx expo install firebase` (Firebase JS SDK, web only). Import it only from `.web.ts` files so it never enters the native bundles. Native keeps `@react-native-firebase/*`.

### 2.3 Messaging service worker

FCM looks for `/firebase-messaging-sw.js` by default. We already have our own `sw.js` (`web/service-worker.js`), so there are two options:

- **Recommended:** a single worker. Add the FCM background handler to `web/service-worker.js` (import `firebase/messaging/sw` via `importScripts` of the compat build, or hand-handle the `push` event) and pass our registration to `getToken({ serviceWorkerRegistration })`. One worker means one update lifecycle.
- Alternative: a separate `public/firebase-messaging-sw.js` with its own scope. This is simpler but means two workers to keep in sync.

The worker must:
- handle `push`: show `self.registration.showNotification(title, { body, icon: '/icons/icon-192.png', badge, data })` using the same payload fields as Android (`notification_id`, `type`, `branch_id`, …);
- handle `notificationclick`: focus an open window or `clients.openWindow()` to the route that `lib/notification-routing.ts` would pick (e.g. `/notification/<id>`).

### 2.4 Permission and token (`lib/push-notifications.web.ts`)

- **Only ask for permission from a user tap.** Safari requires a user gesture, and an unprompted request hurts the opt-in rate everywhere. Show the Settings "Push notifications" toggle on web (when supported) and call `Notification.requestPermission()` inside its handler.
- Feature-detect support: `'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window`. On iOS this is only true when the app was opened from the home screen (`navigator.standalone === true` / `display-mode: standalone`). Otherwise show "Add Wyre to your Home Screen to get alerts."
- After the user grants permission: `getToken(messaging, { vapidKey, serviceWorkerRegistration })`, then `registerDeviceToken({ token, platform: 'web' })`, and store it with `setStoredFcmToken`.
- Mirror `unregisterPushOnLogout`: `deleteToken()` plus the backend `DELETE`.
- Foreground messages: `onMessage()` should refresh the in-app inbox (the same thing `attachPushListeners` does on native) rather than show a system notification while the app is focused.

### 2.5 Small type change

`lib/push-api.ts`:

```ts
platform: 'ios' | 'android' | 'web';
// getPushPlatform(): return 'web' on web when push is supported
```

---

## 3. Backend changes

`lib/push-api.ts` calls:

| Endpoint | Change |
|----------|--------|
| `POST notifications/devices/` `{ token, platform }` | Accept `platform: "web"`. Web FCM tokens are long (~160+ chars), so check the column length. Store the `User-Agent`/browser if useful for support. |
| `DELETE notifications/devices/<token>/` | No change (token is URL-encoded already). |
| `GET notifications/config/` | Add `web_push_ready: boolean` so the client can show or hide the toggle without a release, like `ios_push_ready`. |

Sending:
- Use the FCM HTTP v1 API exactly as for Android, targeting web tokens. Put the user-visible text in `webpush.notification` (title, body, icon `https://<pwa-domain>/icons/icon-192.png`) and the deep-link data in `data`. Set `webpush.fcm_options.link` to the PWA URL to open.
- Handle `UNREGISTERED` / `404` responses by deleting the token. Browser tokens churn more than native ones (cleared site data, uninstalled home-screen app).
- **CORS:** allow the PWA origin on these endpoints (see README → PWA → Deploy).

---

## 4. iOS limits

- Web push works **only for a web app added to the Home Screen** and opened from there. It does not work in a normal Safari tab, nor in Chrome/Firefox on iOS.
- Needs **iOS / iPadOS 16.4 or later**. Older devices get no web push at all.
- Permission must be requested from a **user gesture** (button tap).
- No silent/background data pushes: every push must show a notification. If it doesn't, Safari may revoke the subscription.
- No rich actions or images on iOS. Badging (`navigator.setAppBadge`) works from 16.4.
- If the user deletes the home-screen icon, the subscription is gone, and the backend will see `UNREGISTERED` on the next send.
- Delivery goes through Apple's push service. No APNs certificate is needed for web push. FCM handles VAPID.

Android Chrome and desktop browsers have none of these restrictions (push works in a tab too).

---

## 5. Effort estimate

| Work | Estimate |
|------|----------|
| Firebase web app + VAPID key, env wiring | 0.5 day |
| `push-notifications.web.ts` (permission on tap, token, register/unregister, foreground refresh) | 1–1.5 days |
| Service worker push + notificationclick + routing | 1 day |
| Settings UI on web (support detection, "Add to Home Screen" hint) | 0.5 day |
| Backend: accept `web` platform, `web_push_ready`, FCM `webpush` payload, token cleanup, CORS | 1–2 days |
| Testing: Android Chrome, desktop Chrome/Edge, iPhone 16.4+ home-screen app, logout/refresh/token churn | 1–1.5 days |
| **Total** | **~5–7 developer-days** (client ~3–3.5, backend ~1–2, QA ~1–1.5) |

Risks: iOS delivery and permission UX are the least predictable parts, so test on a real iPhone early. Also, combining FCM with our own service worker needs care so updates don't break push subscriptions (keep the worker URL `/sw.js` and its scope stable).
