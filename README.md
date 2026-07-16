# Wyre Mobile App

Native iOS and Android app for the **Wyre Solar Dashboard** — porting the web solar monitoring experience to mobile.

## Status

Pre-MVP scaffold. UI demo exists; API integration and auth start in Week 1 of the build plan.

## Documentation

**[Technical Scope & Build Plan (docs/TECHNICAL.md)](./docs/TECHNICAL.md)**

Covers:
- What we are building (Solar Dashboard first, Admin/EMS later)
- Full feature inventory from `wyre-dashboard` Solar Overview
- Mobile screen specs mapped from web
- API contract (6 solar endpoints)
- **1-month MVP roadmap** (week-by-week)
- Post-MVP phases

## Web reference

| Web | Mobile MVP |
|-----|------------|
| `wyre-dashboard` → `SolarOverviewPage.js` | Home screen |
| `/alerts-and-alarms` | Settings (operators) |
| 6 solar GET APIs | Same APIs |
| JWT + `branch_id` | Same auth model |

## Quick start (developers)

```bash
npm install
npm start          # Expo Go (UI preview only)
npm run ios        # Native dev build (required for full features)
```

See [docs/TECHNICAL.md](./docs/TECHNICAL.md) for full setup and MVP plan.

## Stack

Expo SDK 54 · React Native · TypeScript · Expo Router · Native iOS tabs · expo-notifications

## Team

Align on `docs/TECHNICAL.md` with Idris before repo push and Hassan onboarding.
