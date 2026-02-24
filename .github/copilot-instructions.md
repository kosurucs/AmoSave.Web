# AmoSave Web — GitHub Copilot Instructions

AmoSave Web is a React 19 trading dashboard that connects to the **AmoSave .NET 8 API** (`http://localhost:5208/api/v1`), which in turn integrates with Zerodha Kite Connect for live market data, order execution, and portfolio management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5 (strict) |
| Routing | React Router v7 |
| Data Fetching | TanStack Query v5 (`@tanstack/react-query`) |
| HTTP Client | Axios (custom `apiClient` instance) |
| Forms | React Hook Form v7 + Zod v4 |
| Tables | TanStack Table v8 |
| Styling | Plain CSS (custom design system, dark theme) |
| Testing | Vitest + Testing Library + MSW (mock service worker) |
| Package Manager | Yarn |

---

## Run, Build, Test

```bash
# Install dependencies
yarn install

# Start dev server (http://localhost:3000)
yarn dev

# Type check
yarn typecheck

# Lint
yarn lint

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Build for production
yarn build
```

> Node version: `^20.19.0 || >=22.12.0` (see `.nvmrc`)

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
VITE_API_BASE_URL=http://localhost:5208/api/v1
VITE_API_KEY=ug5uugdjpf9ortiw
```

If not set, the defaults in `src/services/http/axios-client.ts` are used.

---

## Architecture

```
AmoSave.Web (React, localhost:3000)
    ↓ REST HTTP (Axios + TanStack Query)
AmoSave.Api (.NET 8, localhost:5208/api/v1)
    ↓ Kite Connect SDK
Zerodha Kite (live market data, orders, portfolio)
```

---

## Folder Structure

```
src/
  app/
    layout/           # AppShell, Header, SideNav, MegaMenu, SubMenuTabs
    providers/        # QueryProvider (TanStack Query setup)
    router/           # routes.tsx (all routes), index.tsx (router instance)
    styles/           # Global CSS, design tokens
  features/           # Feature-based modules (one folder per domain)
    auth/             # Login page + Kite OAuth callback
    algo/             # Strategy builder, back-testing pages
    gtt/              # GTT list/create/modify/cancel pages
    margins/          # Order margin, basket margin, contract notes
    market/           # Instruments, quotes, historical, trigger-range pages
    mutual-funds/     # MF holdings, orders, SIPs pages
    orders/           # Place/modify/cancel order, order book, trades pages
    portfolio/        # Positions, holdings, auctions, convert-position pages
    system/           # Watchlist, connection-check, settings pages
    user/             # Profile, margins pages
  services/
    api/              # One service file per API domain (auth, orders, portfolio…)
    http/             # axios-client.ts, interceptors.ts, error-mapper.ts
  shared/
    components/       # Reusable UI components
    lib/              # Utility functions
    types/            # Shared TypeScript types (ApiEnvelope, Dictionary…)
  test/               # Test utilities, MSW handlers
```

---

## Authentication

### Current Flow — Username / Password
1. User enters credentials on `/` (LoginPage)
2. POST `http://localhost:5208/api/v1/user-auth/login` with `{ username, password }`
3. Response: `{ success: true, data: { username, accessToken } }`
4. `accessToken` saved to `localStorage` as `amo.authAccessKey`
5. All subsequent requests include `Authorization: Bearer <accessToken>` (added by Axios interceptor)

### Kite OAuth Flow — Pending Integration
For live trading (connecting to Kite), the additional flow is:
1. Call `GET /api/v1/auth/login-url` → get Kite login URL
2. Redirect user to Kite; after login Kite redirects to `http://localhost:3000?request_token=XXX`
3. App captures `request_token` from URL params
4. POST `http://localhost:5208/api/v1/auth/session` with `{ requestToken }`
5. Response: JWT stored in localStorage, used for all Kite-dependent operations

> ⚠️ The Kite OAuth callback page does not yet exist. It needs to be created at `src/features/auth/pages/kite-callback-page.tsx` and routed at `/kite-callback`.

---

## HTTP Client & Interceptors

**`src/services/http/axios-client.ts`** — creates the shared `apiClient`:
- `baseURL`: `http://localhost:5208/api/v1` (overridable via env or localStorage)
- `timeout`: 15,000 ms

**`src/services/http/interceptors.ts`** — applied to every request:
- Adds `x-correlation-id: <uuid>` header
- Adds `Authorization: Bearer <accessToken>` from `localStorage.amo.authAccessKey`
- Adds `x-api-key: <apiKey>` from `localStorage.amo.apiKey` or env

**Storage keys:**
| Key | Purpose |
|---|---|
| `amo.authUserName` | Logged-in username |
| `amo.authAccessKey` | Bearer token (JWT or accessKey) |
| `amo.apiBaseUrl` | Custom API base URL override |
| `amo.apiKey` | Kite API key override |

---

## API Services Pattern

Each service file in `src/services/api/` follows the same pattern:

```ts
// src/services/api/portfolio.service.ts
import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const portfolioService = {
  async getHoldings() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/portfolio/holdings');
    return response.data.data;   // always unwrap .data.data — never return the envelope
  },
};
```

**Rules:**
- Always type the response as `ApiEnvelope<T>` — the API always wraps in `{ success, data, error }`
- Always return `response.data.data` (the inner payload), not the full envelope
- Use `Dictionary` (`Record<string, unknown>`) for untyped/generic payloads; create typed interfaces when the shape is known

**Existing services:** `auth`, `gtt`, `margins`, `market`, `mutual-funds`, `orders`, `portfolio`, `user`

---

## Shared Types

```ts
// src/shared/types/api.ts
type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

type Dictionary = Record<string, unknown>;
```

---

## Routing

All authenticated routes are nested under `/app` and rendered inside `<AppShell>`:

```
/                     → LoginPage (public)
/kite-callback        → KiteCallbackPage (public, captures request_token)  ← PENDING
/app/watchlist        → WatchlistPage
/app/portfolio/...    → Portfolio pages (positions, holdings, auctions, convert)
/app/orders/...       → Orders pages (list, history, trades, place, modify, cancel)
/app/market/...       → Market pages (instruments, quotes, historical, trigger-range)
/app/margins/...      → Margin pages (order, basket, contract notes)
/app/gtt/...          → GTT pages (list, detail, create, modify, cancel)
/app/mf/...           → Mutual Fund pages (instruments, holdings, orders, SIPs)
/app/user/...         → User pages (profile, margins)
/app/algo/...         → Algo pages (strategy-builder, back-testing)
/app/settings/...     → Settings pages (user, system, connection-check)
```

---

## Navigation / Menu System

`src/app/layout/menu-config.ts` defines two levels of navigation:

- **`mainMenuItems`** — top-level nav bar items: `market`, `trade`, `analyse`, `user`, `app-settings`, `algo`
- **`subMenuTabsByMainMenu`** — sub-tabs shown per main menu item

When adding a new feature:
1. Add the route to `src/app/router/routes.tsx`
2. Add a menu entry in `src/app/layout/menu-config.ts` if it needs to appear in the nav
3. Add a sub-menu tab under the appropriate main menu key

---

## Adding a New Feature — Checklist

1. **Type** → `src/shared/types/<domain>.types.ts` (if typed response shape known)
2. **Service** → `src/services/api/<domain>.service.ts` (Axios + `ApiEnvelope<T>`)
3. **Page(s)** → `src/features/<domain>/pages/<domain>-page.tsx`
4. **Route** → `src/app/router/routes.tsx` under `/app` children
5. **Menu** → `src/app/layout/menu-config.ts` if user-visible
6. **Test** → `src/test/<domain>/<domain>.test.tsx`

---

## Design System

- Dark theme CSS design system — no UI framework (no MUI, Ant Design, etc.)
- CSS classes: `btn`, `btn-primary`, `input`, `select`, `page-card`, `section-title`, `helper`, `error-text`, `form-grid`, `json-view`
- Follow existing CSS patterns — do not introduce inline styles or new frameworks without discussion

---

## Pending Work

| Feature | File to Create | API Endpoint |
|---|---|---|
| Kite OAuth callback | `src/features/auth/pages/kite-callback-page.tsx` | `POST /api/v1/auth/session` |
| Kite session status indicator | Header component update | `GET /api/v1/auth/status` |
| SignalR live ticker | `src/services/signalr/ticker.service.ts` | `ws://localhost:5208/hubs/ticker` |
| Options chain page | `src/features/options/pages/options-chain-page.tsx` | `GET /api/v1/options/chain/{u}/{e}` |
| Risk settings page | `src/features/risk/pages/risk-settings-page.tsx` | `GET/PUT /api/v1/risk/settings` |
| Dashboard summary | `src/features/dashboard/pages/dashboard-page.tsx` | `GET /api/v1/dashboard/summary` |
| Alerts page | `src/features/alerts/pages/alerts-page.tsx` | `GET/POST /api/v1/alerts` |

---

## Connection Check

`/app/settings/connection-check` has a built-in health probe page that:
- Tests the API at `GET {baseUrl}/Health`
- Shows response payload and detailed failure info
- Allows overriding the API base URL and API key at runtime

Use this page first whenever debugging API connectivity issues.

---

## Backend Reference

- **API repo:** `C:\source\Amo` (AmoSave .NET 8 solution)
- **API base URL:** `http://localhost:5208/api/v1`
- **Health check:** `GET http://localhost:5208/api/v1/Health`
- **Swagger UI:** `http://localhost:5208/swagger` (Development only)
- **SignalR hub:** `ws://localhost:5208/hubs/ticker`
- **CORS:** API allows `http://localhost:3000` via `appsettings.json`
