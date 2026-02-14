# AmoSave.Web - Master Implementation Task Plan

## 1) Purpose
This document is the executable implementation backlog for the frontend-only AmoSave project.

Use this as the single checklist for planning, development, QA, release readiness, and session logging.

---

## 2) Execution Rules
- Complete tasks in order unless explicitly marked parallel.
- Update status in this file after each session.
- Every implementation session must have a matching log entry in `.github/logs/sessions/`.
- No task is marked done without validation artifacts (test result, screenshot, or checklist evidence).

## Status Values
- `TODO`
- `IN PROGRESS`
- `DONE`
- `BLOCKED`

---

## 3) Milestone Plan
- **M0**: Foundation & Tooling
- **M1**: App Shell + Login + Navigation (sample-inspired)
- **M2**: Read-Only API Modules
- **M3**: Write Action Modules
- **M4**: GTT + Mutual Funds Completion
- **M5**: Hardening, NFR, Release Readiness

---

## 4) Detailed Task Backlog

## M0 - Foundation & Tooling

| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M0-01 | Initialize React + TypeScript + Vite project with Yarn | Bootstrapped project | - | TODO |
| M0-02 | Install runtime and dev dependencies from setup blueprint | `package.json` locked | M0-01 | TODO |
| M0-03 | Configure TypeScript strict mode and path aliases | Working `tsconfig` setup | M0-01 | TODO |
| M0-04 | Configure ESLint + Prettier rules | Lint and format baseline | M0-02 | TODO |
| M0-05 | Add scripts (`dev`, `build`, `lint`, `typecheck`, `test`) | Verified script commands | M0-02 | TODO |
| M0-06 | Build root folder structure from plan | Empty scalable structure | M0-01 | TODO |
| M0-07 | Configure env strategy (`.env.*`) with validation | `env.ts` with validation | M0-03 | TODO |
| M0-08 | Setup test stack (Vitest + RTL + MSW) | Base test setup works | M0-02 | TODO |
| M0-09 | Setup CI checks for lint/typecheck/test/build | CI pipeline green | M0-04, M0-08 | TODO |
| M0-10 | Create baseline session log for setup execution | Log file in `.github/logs/sessions` | M0-01 | TODO |

### M0 Done Criteria
- Local app runs.
- Lint, typecheck, test, build pass.
- Folder skeleton committed.
- Session log recorded.

---

## M1 - App Shell + Login + Navigation

| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M1-01 | Implement global dark theme tokens (`theme.css`) | Unified visual tokens | M0-06 | DONE |
| M1-02 | Build fixed top header layout | Header shell visible | M1-01 | DONE |
| M1-03 | Add top navigation items (`Trade`, `Analyse`, `Watchlist`, `Positions`, `Orders`) | Working nav links | M1-02 | DONE |
| M1-04 | Implement `Trade` mega-menu panel | Multi-column panel | M1-03 | DONE |
| M1-05 | Implement `Analyse` mega-menu panel | Multi-column panel | M1-03 | DONE |
| M1-06 | Add right profile menu trigger | Profile icon/menu | M1-02 | DONE |
| M1-07 | Create login page two-column layout | Visual match with reference style | M1-01 | DONE |
| M1-08 | Add login card CTAs and legal/footer text | Functional UI layer | M1-07 | DONE |
| M1-09 | Add placeholder pages for watchlist/positions/orders | Route placeholders | M1-03 | DONE |
| M1-10 | Responsive checks for 1366 and 1536 widths | Layout screenshots/checklist | M1-04, M1-05, M1-07 | IN PROGRESS |
| M1-11 | Accessibility pass for nav and login (keyboard/focus) | A11y checklist | M1-03, M1-07 | IN PROGRESS |
| M1-12 | Session log update for M1 | Log entry with screenshots/notes | M1-10 | DONE |
| M1-13 | Move primary navigation to persistent left-side main menu | Main menu-first app shell UX | M1-03 | DONE |
| M1-14 | Load contextual submenus as top tab menus by active main menu | Route-aware tab submenu behavior | M1-13 | DONE |
| M1-15 | Extend navigation with App Settings, Algo, Stragy Builder groups | New menu groups + routes/pages | M1-14 | DONE |

### M1 Done Criteria
- Login and navigation UI matches sample-inspired direction.
- Mega menus work reliably.
- Basic accessibility pass complete.
- Session log recorded.

---

## M2 - Read-Only API Modules

### M2-A Shared API Layer
| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M2-01 | Create Axios client singleton | `axios-client.ts` | M0-06 | DONE |
| M2-02 | Add request/response interceptors | Interceptor chain active | M2-01 | DONE |
| M2-03 | Implement normalized error mapper | Shared error handling | M2-02 | DONE |
| M2-04 | Add query key factory utilities | Consistent cache keys | M2-01 | DONE |
| M2-05 | Add reusable loading/empty/error components | Shared page states | M1-01 | DONE |

### M2-B Domain Read Flows
| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M2-10 | User profile page + service integration | Profile read flow | M2-01 | DONE |
| M2-11 | User margins page + segment filter | Margins read flow | M2-10 | DONE |
| M2-12 | Portfolio positions page | Positions read flow | M2-01 | DONE |
| M2-13 | Portfolio holdings page | Holdings read flow | M2-01 | DONE |
| M2-14 | Portfolio auctions page | Auctions read flow | M2-01 | DONE |
| M2-15 | Orders list page | Orders read flow | M2-01 | DONE |
| M2-16 | Order history detail view | Order detail flow | M2-15 | DONE |
| M2-17 | Trades page | Trades read flow | M2-01 | DONE |
| M2-18 | Instruments page with table/search | Instruments read flow | M2-01 | DONE |
| M2-19 | Quote/OHLC/LTP read widgets | Market snapshots | M2-18 | DONE |
| M2-20 | Historical data page | Historical chart/table flow | M2-18 | DONE |
| M2-21 | Trigger range page | Trigger range read flow | M2-18 | DONE |

### M2-C QA Tasks
| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M2-30 | Unit tests for API services (read endpoints) | Service test suite | M2-10..M2-21 | TODO |
| M2-31 | UI tests for loading/empty/error states | Render behavior tests | M2-10..M2-21 | TODO |
| M2-32 | Session log update for M2 | Evidence log + notes | M2-30, M2-31 | DONE |

### M2 Done Criteria
- All read-only routes from scope are integrated.
- Shared error and state handling is consistent.
- Tests cover key screens and states.

---

## M3 - Write Action Modules

| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M3-01 | Build order placement form with schema validation | Place order flow | M2-01 | DONE |
| M3-02 | Build order modify flow | Modify order flow | M3-01 | DONE |
| M3-03 | Build order cancel flow | Cancel order flow | M3-01 | DONE |
| M3-04 | Build convert position form | Convert position flow | M2-12 | DONE |
| M3-05 | Build order margin preview form | Margin preview flow | M2-01 | DONE |
| M3-06 | Build basket margin estimator form | Basket margin flow | M3-05 | DONE |
| M3-07 | Build virtual contract note request page | Charges flow | M2-01 | DONE |
| M3-08 | Add mutation UX guardrails (confirmations, disabled states, errors) | Safe action UX | M3-01..M3-07 | IN PROGRESS |
| M3-09 | Add optimistic/refetch strategy per mutation | Consistent data refresh | M3-01..M3-07 | IN PROGRESS |
| M3-10 | Mutation failure-path tests | Negative test suite | M3-08 | TODO |
| M3-11 | Session log update for M3 | Evidence log + notes | M3-10 | DONE |

### M3 Done Criteria
- All planned write actions are functional.
- Validation and failure handling are robust.
- Mutation tests and logs are complete.

---

## M4 - GTT + Mutual Funds Completion

### M4-A GTT
| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M4-01 | GTT list page | Read flow | M2-01 | DONE |
| M4-02 | GTT detail page | Read flow | M4-01 | DONE |
| M4-03 | GTT create form | Create flow | M4-01 | DONE |
| M4-04 | GTT modify form | Update flow | M4-03 | DONE |
| M4-05 | GTT cancel action | Delete flow | M4-01 | DONE |

### M4-B Mutual Funds
| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M4-10 | MF instruments page | Read flow | M2-01 | DONE |
| M4-11 | MF orders list/detail pages | Read flow | M4-10 | DONE |
| M4-12 | MF place/cancel order flows | Write flow | M4-11 | DONE |
| M4-13 | MF SIP list/detail pages | Read flow | M4-10 | DONE |
| M4-14 | MF create/modify/cancel SIP flows | Write flow | M4-13 | DONE |
| M4-15 | MF holdings page | Read flow | M4-10 | DONE |

### M4-C QA
| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M4-20 | End-to-end tests for GTT critical flows | E2E coverage | M4-01..M4-05 | DONE |
| M4-21 | End-to-end tests for MF critical flows | E2E coverage | M4-10..M4-15 | DONE |
| M4-22 | Session log update for M4 | Evidence log + notes | M4-20, M4-21 | DONE |

### M4 Done Criteria
- GTT and MF route groups implemented end-to-end.
- Critical E2E paths pass.

---

## M5 - Hardening, NFR, Release Readiness

| ID | Task | Output | Depends On | Status |
|---|---|---|---|---|
| M5-01 | Bundle and performance analysis | Report + improvements | M4 complete | TODO |
| M5-02 | API request tuning (debounce/cancel/stale) | Stable UX under load | M2 complete | TODO |
| M5-03 | Accessibility verification and fixes | A11y checklist pass | M4 complete | TODO |
| M5-04 | Security checks (frontend storage/logging/sanitization) | Security checklist pass | M4 complete | TODO |
| M5-05 | Error monitoring integration validation | Alert + error visibility | M4 complete | TODO |
| M5-06 | Final regression smoke tests | Release smoke report | M5-01..M5-05 | TODO |
| M5-07 | Update coverage matrix statuses and owners | Final matrix state | M5-06 | TODO |
| M5-08 | Final release checklist and rollback confirmation | Release sign-off | M5-06 | TODO |
| M5-09 | Final session log + release log entry | Auditable completion log | M5-08 | TODO |

### M5 Done Criteria
- NFR checks complete.
- Release checklist complete.
- Logs and coverage matrix are fully updated.

---

## 5) Cross-Cutting Task Set (Parallel)

| ID | Task | Frequency | Status |
|---|---|---|---|
| X-01 | Keep `.github/logs/sessions` updated per work session | Every session | TODO |
| X-02 | Update coverage matrix status after completed endpoint flow | Every completed flow | TODO |
| X-03 | Keep decision records updated in governance doc | As decisions are made | TODO |
| X-04 | Validate naming and branding is always `AmoSave` | Every UI PR | TODO |
| X-05 | Keep docs synchronized with implementation changes | Weekly or per milestone | TODO |

---

## 6) Suggested Weekly Cadence
- **Day 1-2**: Build tasks
- **Day 3**: Integration and error handling
- **Day 4**: Test and refactor
- **Day 5**: Documentation, matrix updates, session logs, milestone review

---

## 7) Traceability Links
- Architecture: [01-solution-architecture.md](./01-solution-architecture.md)
- Coverage: [02-api-ui-coverage-matrix.md](./02-api-ui-coverage-matrix.md)
- Roadmap: [03-phased-roadmap.md](./03-phased-roadmap.md)
- Setup: [04-react-typescript-yarn-eslint-setup.md](./04-react-typescript-yarn-eslint-setup.md)
- UI Reference: [05-ui-reference-from-sample.md](./05-ui-reference-from-sample.md)
- NFR/Governance: [06-nfr-release-governance.md](./06-nfr-release-governance.md)
- Logs Root: [../../.github/logs/README.md](../../.github/logs/README.md)
