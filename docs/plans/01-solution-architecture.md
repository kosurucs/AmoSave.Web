# AmoSave.Web - Frontend-Only Architecture Plan

## 1) Objective
Build a maintainable React web application UI that supports all required API workflows by calling an existing Web API for every request.

This repository focuses only on frontend implementation. Backend and connector services are external dependencies.

## 2) Frontend Boundary

```text
Browser (AmoSave.Web React UI)
    -> External Web API (already available / separate project)
        -> DotNetKiteConnector and provider integrations
```

## 3) Core Principles (Best Practices)
- Keep frontend strictly API-consumer only (no business logic duplication).
- Use TypeScript-first contracts for API requests/responses.
- Keep all API calls in one client layer (`src/services`).
- Use feature-first folder structure to scale modules independently.
- Use centralized error handling and normalized API error model.
- Keep route-level code splitting and lazy loading for performance.
- Ensure every screen has loading, empty, success, and error states.

## 4) UI Information Architecture
Group UI by business domain:
- Session & Auth
- User
- Orders & Trades
- Portfolio
- Market Data
- GTT
- Mutual Funds
- System/Diagnostics

This mirrors API groups and simplifies ownership/testing.

## 5) API Contract Strategy (Frontend)
- Do not hardcode provider route names in components.
- Use frontend service routes via typed methods, for example:
  - `authService.createSession(...)`
  - `userService.getProfile()`
  - `ordersService.placeOrder(...)`
- Keep API base URL in environment configuration only.

## 6) Cross-Cutting Standards
- Validation: `zod` schemas for forms and API payload parsing.
- HTTP: Axios instance with interceptors for auth/error mapping.
- State:
  - Server state with TanStack Query
  - Local UI state with React hooks/store
- Tables: TanStack Table for high-volume data views.
- Forms: React Hook Form + `zodResolver`.

## 6.1) Environment & Config Strategy
- Use `.env` per environment (`.env.local`, `.env.dev`, `.env.stage`, `.env.prod`).
- Keep only non-secret frontend variables (`VITE_API_BASE_URL`, `VITE_APP_NAME`, `VITE_ENABLE_DEBUG_UI`).
- Validate env values at app startup and fail fast for missing required keys.

## 6.2) Accessibility & UX Baseline
- All interactive controls must be keyboard-accessible.
- Maintain visible focus styles in dark theme.
- Use semantic headings and labels for forms.
- Ensure contrast passes WCAG AA for core navigation and action buttons.

## 6.3) Performance Baseline
- Route-level lazy loading for feature pages.
- Virtualized rendering for large data grids where needed.
- Debounce search/filter inputs and cancel stale API calls.
- Cache strategy via TanStack Query stale/cache times per endpoint class.

## 7) Security & Reliability (Frontend)
- Never store secrets in frontend.
- Use `httpOnly` cookies if backend supports them.
- Avoid token logging and sensitive response logging.
- Debounce high-frequency quote calls and cancel stale requests.
- Handle 401/403 globally with redirect/session reset flow.

## 8) Quality Gates (Definition of Done)
A frontend feature is done only if:
1. Screen is wired to real API client method (no mock-only path).
2. Loading/empty/error/success states are complete.
3. Form and payload validation are implemented.
4. Unit tests cover core rendering and user actions.
5. Route is marked complete in coverage matrix.

## 9) Delivery Strategy
Implement vertical frontend slices per domain (route + feature components + API service + tests), starting from read-only flows and then write actions.

Use [04-react-typescript-yarn-eslint-setup.md](./04-react-typescript-yarn-eslint-setup.md) as the implementation blueprint.

## 10) Governance & Traceability
- Use a per-session implementation log under `.github/logs/sessions/`.
- Track architecture and scope decisions in `docs/plans/06-nfr-release-governance.md`.
- Record Copilot prompt/instruction execution and outcomes in `.github/logs/` artifacts.
