# Wyre Mobile App — Technical Scope & Build Plan

**Version:** 0.2.0  
**Date:** July 2026  
**Status:** Pre-repo / team alignment  
**Audience:** Idris (senior dev), Hassan (contributor), mobile team  
**Web reference:** `wyre-dashboard` → `SolarOverviewPage.js`

---

## 1. What this document is for

This document answers what Idris asked for:

1. **What the Wyre mobile app will include** — features, screens, and capabilities
2. **Technical scope of the Solar Dashboard** — mapped from the existing web product
3. **What we are building first** — Solar Dashboard MVP (not Admin or EMS yet)
4. **How we will build it** — tools, APIs, and a **1-month MVP plan**

---

## 2. Product vision

### 2.1 What Wyre Mobile is

A **native mobile app** (iOS and Android) that gives Wyre solar customers the same monitoring experience they get on the **Wyre Solar Dashboard web app**, optimized for phones.

Solar customers today use the web dashboard at `/solar-overview` to monitor:

- Live PV production and capacity
- Weather at the site
- Energy yield across generation, battery, load, and grid
- Real-time energy flow between system components
- Hourly charts for consumption, PV production, and battery

The mobile app will deliver this on the go, with pull-to-refresh, native notifications, and a mobile-first layout.

### 2.2 What we are NOT building in the first release

| Product | Status |
|---------|--------|
| **Solar Dashboard (client)** | **Phase 1 — MVP (Month 1)** |
| Admin Dashboard | Future phase |
| EMS (Energy Management System) dashboard | Future phase |
| Multi-branch portfolio overview (admin-style) | Future phase |
| Billing, reports, scorecard (general energy product) | Out of scope for Solar MVP |

### 2.3 Who uses it

Mapped from the web dashboard auth model:

| User | Access | Notes |
|------|--------|-------|
| **Solar customer** (`is_solar_customer === true`) | Solar Overview + optional Alerts | Primary MVP audience |
| **Operator** (`role_text === "OPERATOR"`) | Above + Alert preferences | Can configure solar alert thresholds |
| **Non-operator solar user** | Solar Overview only | Read-only monitoring |
| **Admin users** | Not in MVP | Admins use a separate admin portal on web |

All solar data is scoped to a single **`branch_id`** from the user's JWT token (same as web).

---

## 3. Web reference: Wyre Solar Dashboard

The mobile MVP must achieve **parity with the web Solar Overview page**.

**Source file:** `wyre-dashboard/src/mainAppPages/SolarOverviewPage.js`  
**Route:** `/solar-overview` (also embedded at `/dashboard` for solar-only customers)  
**Backend:** `https://backend.wyreng.com/api/v1/`  
**Auth:** JWT Bearer token, `branch_id` from token

The web page is a **single monitoring screen** backed by **6 read-only API endpoints**. It does not have export, multi-branch lists, or an alarm inbox.

---

## 4. Web Solar Overview — feature inventory (technical)

This is what exists on web today. The mobile app will port these capabilities.

### 4.1 Section A — Live overview card (weather + gauge)

**API:** `GET solar/overview/{branchId}/`

| UI element | Data field | Unit |
|------------|------------|------|
| Location | `weather.city` | text |
| Weather condition | `weather.condition` | text |
| Temperature | `weather.temperature_c` | °C |
| Sunshine window | `weather.sunshine` | text (UTC+01) |
| Capacity utilization ring | `metrics.percentage_usage` | % |
| PV production (live) | `metrics.pv_production_kw` | kW |
| Installed capacity | `metrics.installed_capacity_kWp` | kWp |

**Refresh:** Loads once on page mount (no polling on web).

---

### 4.2 Section B — Energy summary (tabbed yield)

**API:** `GET solar/yield/{branchId}/`

Four tabs, each showing **3 time periods** with **kWh + NGN cost**:

| Tab | Periods | Data path |
|-----|---------|-----------|
| **Generation** | Total yield, Today's yield, Current month's yield | `generation.{total,today,monthly}.{kwh,cost}` |
| **Battery** | Total, Today, Current month | `battery.{total,today,monthly}.{kwh,cost}` |
| **Load** | Consumption, Today's energy, Current month | `load.{total,today,monthly}.{kwh,cost}` |
| **Grid** | Import, Today's energy, Current month | `grid.{total,today,monthly}.{kwh,cost}` |

12 data rows total (4 tabs × 3 periods).

---

### 4.3 Section C — Energy flow diagram (site status)

**API:** `GET solar/site-status/{branchId}/`

Real-time power flow between system nodes:

| Node | Displays | Key fields |
|------|----------|------------|
| **Production** (center) | Live kW | `pv.kw` |
| **Capacity** | kWp + fill % | `pv.installed_capacity_kwp`, `pv.percentage` |
| **Battery** | kW, SOC %, Charging/Discharging/Idle | `battery.kw`, `battery.percentage`, `battery.direction` |
| **Grid** | kW, ON/OFF | `grid.kw`, `grid.status`, `grid.direction` |
| **Usage / Load** | kW | `load.kw`, `load.direction` |
| **Generator** (conditional) | kW, ON/OFF | Only if `generator_power.status === "ON"` |

Flow direction: `IN` (toward production), `OUT` (from node), `IDLE` (static).

On mobile this becomes a **simplified vertical or card-based flow view** (full SVG animation is optional for MVP).

---

### 4.4 Section D — Consumption chart

**API:** `GET solar/{branchId}/consumption-hourly-plot/?month={m}&year={y}&day={d}`

| Element | Detail |
|---------|--------|
| Chart type | Stacked area (hourly) |
| Series | Production (kW), Grid (kW), Load (kW) |
| X-axis | `hours[].hour_label` |
| Date filter | DatePicker — refetches on change |
| Parameter filter | All / Production / Grid / Load (UI toggle, no extra API call) |

---

### 4.5 Section E — PV production chart

**API:** `GET solar/{branchId}/pv-production-hourly-plot/?month={m}&year={y}&day={d}`

| Element | Detail |
|---------|--------|
| Chart type | Area (hourly) |
| Series | Production (kW) from `hours[].pv_kw` |
| Date filter | DatePicker — refetches on change |

---

### 4.6 Section F — Battery chart

**API:** `GET solar/{branchId}/battery-backup-hourly-plot/?month={m}&year={y}&day={d}`

| Element | Detail |
|---------|--------|
| Chart type | Multi-area (hourly) |
| Series | Backup load, Battery charge, Battery discharge |
| Fields | `backup_load_kwh`, `battery_charge_kwh`, `battery_discharge_kwh` |
| Date filter | DatePicker — refetches on change |

---

### 4.7 Related web page — Alert preferences (not Solar Overview)

**Route:** `/alerts-and-alarms` (operators only)

**APIs:**
- `GET alerts_data/{branchId}`
- `POST alerts_data/{branchId}/`

Solar-specific alert settings:

| Setting | Description |
|---------|-------------|
| `daily_battery_soc_alerts` | Battery level alerts |
| `daily_unfavorable_weather_alerts` | Unfavourable weather alerts |
| `solar_capacity_utilization_threshold_pct` | Threshold 0–90% |
| `solar_capacity_utilization_alerts` | Capacity utilization alerts |

**Note:** Web has alert **configuration** only. There is no alarm inbox or notification history on web.

---

### 4.8 What the web Solar page does NOT have

These were in the mobile UI demo but are **not** in the web solar product:

| Feature | Web status |
|---------|------------|
| Export CSV | Not on solar page |
| Multi-branch KPI aggregation | Single branch from JWT only |
| Branch list page | Branch switcher in sidebar only |
| Alarm inbox / "All clear" feed | Not built |
| Reports tab | Not in solar product |
| Manual refresh button | Loads on mount only |
| Pull-to-refresh | N/A on web |

---

## 5. Mobile app — what we will build

### 5.1 MVP goal (1 month)

Deliver a **working Solar Dashboard mobile app** that:

1. Authenticates solar customers (JWT login)
2. Shows live overview, energy summary, site status, and hourly charts
3. Uses the **same 6 solar APIs** as the web dashboard
4. Supports pull-to-refresh (mobile improvement over web)
5. Allows operators to configure solar alert preferences
6. Sends native push/local notifications for solar alerts (mobile-only enhancement)

### 5.2 Mobile screens (MVP)

| Screen | Maps from web | Priority |
|--------|---------------|----------|
| **Login** | Web auth flow | P0 — Week 1 |
| **Solar Overview (Home)** | `SolarOverviewPage` — all 6 sections | P0 — Weeks 2–3 |
| **Alert Settings** | `/alerts-and-alarms` (solar subset) | P1 — Week 4 |
| **Branch switcher** | Sidebar branch switch | P1 — Week 4 (if user has multiple branches) |

**Deferred from current mobile scaffold (not in web solar MVP):**

| Screen | Decision |
|--------|----------|
| Branches list tab | Defer — web has no branch list page |
| Reports tab | Defer — not in solar web product |
| Alerts inbox tab | Defer — build settings first; inbox is post-MVP |

### 5.3 Mobile navigation (proposed for MVP)

```
Login
  └── Main app (native tab bar)
        ├── Home          → Solar Overview (scrollable: overview + yield + flow + charts)
        ├── Energy        → Energy summary tabs OR merged into Home scroll
        ├── Charts        → Consumption / PV / Battery (OR merged into Home)
        └── Settings      → Alert preferences + logout + branch switch
```

**Recommendation:** For MVP, use **2 tabs** (Home + Settings) with Home as one scrollable Solar Overview mirroring the web page. Add more tabs only if Home feels too long. The current 4-tab scaffold (Home, Branches, Alerts, Reports) should be revised to match web scope.

---

## 6. Mobile screen spec — technical breakdown

### 6.1 Login screen

| Requirement | Detail |
|-------------|--------|
| Email / password login | Same credentials as web |
| Token storage | Secure storage (`expo-secure-store`) |
| JWT decode | Extract `branch_id`, `is_solar_customer`, `role_text` |
| Route guard | Only `is_solar_customer` users enter solar app |
| Error states | Invalid credentials, network error |

---

### 6.2 Home — Solar Overview

Single scrollable screen, sections in order (matches web layout):

#### Block 1 — Live snapshot (top KPI row)

Replaces current demo KPI cards with real API data.

| Mobile card | API source | Fields |
|-------------|------------|--------|
| Generating now | `solar/overview` | `metrics.pv_production_kw` kW |
| Installed capacity | `solar/overview` | `metrics.installed_capacity_kWp` kWp |
| Utilization | `solar/overview` | `metrics.percentage_usage` % |
| Weather strip | `solar/overview` | city, condition, temp, sunshine |

**Actions:** Pull-to-refresh, tap refresh button.

#### Block 2 — Energy summary

Horizontal tabs or segmented control: **Generation | Battery | Load | Grid**

Each tab shows 3 rows:

| Row | kWh | NGN cost |
|-----|-----|----------|
| Total | `*.total.kwh` | `*.total.cost` |
| Today | `*.today.kwh` | `*.today.cost` |
| This month | `*.monthly.kwh` | `*.monthly.cost` |

**API:** `solar/yield/{branchId}/`

#### Block 3 — Site status / energy flow

Simplified mobile flow diagram:

```
[Capacity] ──→ [Production] ──→ [Load]
                  ↑    ↓
              [Battery] [Grid]
              [Generator] (if ON)
```

Each node shows: label, kW value, status pill (ON/OFF, Charging/Discharging).

**API:** `solar/site-status/{branchId}/`

#### Block 4 — Charts (stacked vertically)

| Chart | API | Mobile controls |
|-------|-----|-----------------|
| Consumption | `consumption-hourly-plot` | Date picker + parameter filter |
| PV Production | `pv-production-hourly-plot` | Date picker |
| Battery | `battery-backup-hourly-plot` | Date picker |

**Chart library (proposed):** `react-native-gifted-charts` or `victory-native` (team to confirm).

#### Block 5 — Loading and error states

Each block has its own loading spinner and error retry (web uses per-section `Spin`).

---

### 6.3 Settings — Alert preferences (operators only)

Visible only when `role_text === "OPERATOR"`.

| Setting | Control | API field |
|---------|---------|-----------|
| Battery level alerts | Toggle | `daily_battery_soc_alerts` |
| Weather alerts | Toggle | `daily_unfavorable_weather_alerts` |
| Capacity utilization alerts | Toggle | `solar_capacity_utilization_alerts` |
| Utilization threshold | Slider 0–90% | `solar_capacity_utilization_threshold_pct` |

**APIs:** `GET` and `POST alerts_data/{branchId}/`

Also on this screen:
- Branch switcher (if applicable)
- Logout
- App version

---

### 6.4 Notifications (mobile enhancement)

Not on web today. Planned for MVP Week 4:

| Type | Trigger | Implementation |
|------|---------|----------------|
| Local notification demo | Dev/testing | `expo-notifications` (already scaffolded) |
| Push notifications | Backend alert events | `expo-notifications` + push token registration |
| Foreground banners | App open | Notification handler (already configured) |

**Dependency:** Backend must support push token registration (confirm with Idris).

---

## 7. API contract (MVP)

**Base URL:** `https://backend.wyreng.com/api/v1/`  
**Auth header:** `Authorization: Bearer {access_token}`  
**Branch scope:** `{branchId}` from JWT

| # | Method | Endpoint | Used in | MVP |
|---|--------|----------|---------|-----|
| 1 | GET | `solar/overview/{branchId}/` | Live overview | Yes |
| 2 | GET | `solar/yield/{branchId}/` | Energy summary | Yes |
| 3 | GET | `solar/site-status/{branchId}/` | Flow diagram | Yes |
| 4 | GET | `solar/{branchId}/consumption-hourly-plot/?month=&year=&day=` | Consumption chart | Yes |
| 5 | GET | `solar/{branchId}/pv-production-hourly-plot/?month=&year=&day=` | PV chart | Yes |
| 6 | GET | `solar/{branchId}/battery-backup-hourly-plot/?month=&year=&day=` | Battery chart | Yes |
| 7 | GET | `alerts_data/{branchId}` | Alert settings | Yes (Week 4) |
| 8 | POST | `alerts_data/{branchId}/` | Save alert settings | Yes (Week 4) |
| 9 | POST | Auth login endpoint | Login | Yes (Week 1) |
| 10 | POST | Branch switch endpoint | Branch switcher | If needed (Week 4) |

---

## 8. Data models (TypeScript)

```typescript
// GET solar/overview/{branchId}/
interface SolarOverview {
  weather: {
    city: string;
    condition: string;
    temperature_c: number;
    sunshine: string;
  };
  metrics: {
    pv_production_kw: number;
    installed_capacity_kWp: number;
    percentage_usage: number;
  };
}

// GET solar/yield/{branchId}/
interface YieldPeriod {
  kwh: number;
  cost: number;
}
interface SolarYield {
  generation: { total: YieldPeriod; today: YieldPeriod; monthly: YieldPeriod };
  battery:    { total: YieldPeriod; today: YieldPeriod; monthly: YieldPeriod };
  load:       { total: YieldPeriod; today: YieldPeriod; monthly: YieldPeriod };
  grid:       { total: YieldPeriod; today: YieldPeriod; monthly: YieldPeriod };
}

// GET solar/site-status/{branchId}/
interface SiteNode {
  kw: number;
  direction?: 'IN' | 'OUT' | 'IDLE';
  percentage?: number;
  status?: 'ON' | 'OFF';
  installed_capacity_kwp?: number;
}
interface SolarSiteStatus {
  pv: SiteNode;
  battery: SiteNode;
  grid: SiteNode;
  load: SiteNode;
  generator_power?: SiteNode;
}

// Chart responses
interface SolarHourlyChart {
  hours: Array<{
    hour_label: string;
    pv_kw?: number;
    grid_kw?: number;
    load_kw?: number;
    backup_load_kwh?: number;
    battery_charge_kwh?: number;
    battery_discharge_kwh?: number;
  }>;
}
```

---

## 9. Technology stack (mobile)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Expo SDK 54 | Managed workflow, OTA updates |
| UI | React Native 0.81 | iOS + Android |
| Language | TypeScript (strict) | Shared types with API models |
| Routing | Expo Router 6 | File-based, typed routes |
| Navigation | Native iOS tab bar | `expo-router/unstable-native-tabs` |
| HTTP client | TanStack Query + fetch | Proposed for API caching/refetch |
| Auth storage | expo-secure-store | JWT tokens |
| Notifications | expo-notifications | Local + push |
| Charts | TBD (gifted-charts or victory-native) | Week 3 decision |
| Styling | StyleSheet + WyreColors tokens | Matches web brand `#5C12A7` |

**Development build required** — Expo Go does not support full notification branding or native tabs.

---

## 10. One-month MVP roadmap

**Target:** Solar Dashboard mobile app at web feature parity for a single branch.

### Week 1 — Foundation

| Task | Deliverable |
|------|-------------|
| Repo setup and team alignment | Shared repo, branch strategy, `.env.example` |
| Auth flow | Login screen, JWT storage, route guard |
| API client skeleton | Base URL, auth interceptor, error handling |
| Wire `solar/overview` | Live snapshot block with real data |
| Remove demo/static KPI values | Home shows real kW, kWp, weather |

**Exit criteria:** User can log in and see live PV production + weather for their branch.

---

### Week 2 — Core data blocks

| Task | Deliverable |
|------|-------------|
| Wire `solar/yield` | Energy summary tabs (Generation, Battery, Load, Grid) |
| Wire `solar/site-status` | Site status / simplified flow diagram |
| Pull-to-refresh | Refetch all 3 endpoints on pull |
| Loading and error states | Per-section spinners and retry |
| Revise tab navigation | Align tabs with MVP scope (drop placeholder Branches/Reports) |

**Exit criteria:** Home screen shows overview + yield + site status with live API data.

---

### Week 3 — Charts

| Task | Deliverable |
|------|-------------|
| Chart library decision and setup | Pick and integrate chart package |
| Consumption chart | Hourly stacked area + date picker + param filter |
| PV production chart | Hourly area + date picker |
| Battery chart | Hourly multi-series + date picker |
| Chart loading states | Independent fetch per chart |

**Exit criteria:** All 3 hourly charts work with date selection, matching web.

---

### Week 4 — Alerts, polish, release candidate

| Task | Deliverable |
|------|-------------|
| Alert settings screen | GET/POST `alerts_data` for operators |
| Push notification setup | Token registration + backend hookup |
| Branch switcher | If user has multiple branches |
| Wyre branding QA | Icon, splash, notification icon on dev build |
| Bug fixes and performance | Scroll performance, API error edge cases |
| TestFlight / internal APK | First internal release to team |

**Exit criteria:** MVP ready for internal testing. Operator can configure alerts. All 6 solar APIs wired.

---

### MVP success checklist

- [ ] Solar customer can log in
- [ ] Live overview shows real PV kW, capacity, utilization, weather
- [ ] Energy summary shows all 4 tabs with kWh + NGN
- [ ] Site status shows production, battery, grid, load (and generator if ON)
- [ ] Consumption chart with date filter and parameter toggle
- [ ] PV production chart with date filter
- [ ] Battery chart with date filter
- [ ] Pull-to-refresh on home screen
- [ ] Operator can view and save alert preferences
- [ ] App runs as standalone Wyre build (not Expo Go)
- [ ] iOS and Android internal builds distributed to team

---

## 11. Post-MVP phases

### Phase 2 — Solar enhancements (Month 2)

| Feature | Notes |
|---------|-------|
| Push notification delivery | Real alerts from backend events |
| Alarm history / inbox | Net-new (not on web) |
| Offline caching | Last-known data when offline |
| iPad / tablet layout | Wider flow diagram |

### Phase 3 — Admin Dashboard (Month 3+)

Port relevant sections from `admin_frontend_v2` Solar Overview:

- Multi-branch list and KPI aggregation
- Branch detail drawer
- Alarms drawer with severity grouping
- Watchlist
- Export CSV

This is a **separate product surface** for admin users, not solar customers.

### Phase 4 — EMS Dashboard (TBD)

Scope to be defined with product team. Not started.

---

## 12. Current mobile scaffold vs MVP

What exists in `wyre-app` today vs what MVP needs:

| Item | Scaffold today | MVP needs |
|------|----------------|-----------|
| Solar overview UI | Demo layout with `0` values | Wire to 6 APIs |
| KPI cards | Static demo data | Real `solar/overview` + `solar/yield` |
| 4 tabs (Home, Branches, Alerts, Reports) | Placeholder tabs | Revise to Home + Settings |
| Notifications | Local demo burst | Push + alert-driven |
| Auth | Not built | JWT login Week 1 |
| API layer | Not built | TanStack Query + fetch Week 1 |
| Branding | Wyre icon, splash | Keep |
| Native tab bar | Implemented | Keep, revise tab labels |

---

## 13. Open questions for Idris

| # | Question | Impact |
|---|----------|--------|
| 1 | Confirm MVP = web Solar Overview parity only? | Scope |
| 2 | Auth endpoint — same as web login? | Week 1 |
| 3 | Push token API — does backend support it? | Week 4 |
| 4 | Chart library preference? | Week 3 |
| 5 | Single scrollable Home vs multiple tabs for charts? | Navigation |
| 6 | Branch switch — how many users have multiple branches? | Week 4 priority |
| 7 | Minimum iOS/Android versions? | Build config |
| 8 | EAS Build for TestFlight/APK distribution? | Week 4 |
| 9 | Staging API URL for development? | Week 1 |
| 10 | Admin Dashboard mobile — separate app or same app with role gate? | Phase 3 planning |

---

## 14. Appendix

### A. Web file references

| File | Purpose |
|------|---------|
| `wyre-dashboard/src/mainAppPages/SolarOverviewPage.js` | Full solar UI |
| `wyre-dashboard/src/redux/actions/solar/solar.action.js` | 6 API thunks |
| `wyre-dashboard/src/mainAppPages/AlertsAndAlarms.js` | Alert preferences |
| `wyre-dashboard/src/components/BranchSwitcher.js` | Branch context |

### B. Mobile repo (current scaffold)

| Path | Purpose |
|------|---------|
| `app/(tabs)/index.tsx` | Home — to become Solar Overview |
| `lib/solar-notifications.ts` | Notification demo (replace with real push) |
| `constants/theme.ts` | Wyre brand tokens |
| `docs/TECHNICAL.md` | This document |

### C. Related products

| Product | Repo | Relationship |
|---------|------|--------------|
| Solar Dashboard (web) | `wyre-dashboard` | **MVP reference** |
| Admin Solar Overview | `admin_frontend_v2` | Phase 3 reference |
| Mobile app | `wyre-app` | This project |

---

*Review with Idris. Once MVP scope is signed off, create the shared repo and begin Week 1.*
