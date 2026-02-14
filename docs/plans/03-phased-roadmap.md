# AmoSave.Web - Phased Roadmap

## Phase 0 - Foundations (1 week)
**Goal:** Prepare frontend architecture and standards before feature implementation.

### Deliverables
- React + TypeScript + Yarn workspace setup
- ESLint + Prettier + import order rules
- API client base layer (Axios, interceptors, error mapping)
- Routing shell, layout, and navigation scaffolding
- AmoSave visual shell (dark theme tokens, top nav, mega-menu baseline)
- CI pipeline with lint/build/test gates

### Exit Criteria
- Local frontend environment runs end-to-end
- API base URL environment strategy finalized
- Coding standards and PR checklist documented
- Login and top navigation match approved sample-inspired reference

---

## Phase 1 - Read-Only MVP (2 weeks)
**Goal:** Deliver all read-only UI modules first.

### Frontend Scope
- User: profile, margins pages
- Portfolio: holdings, positions, auctions pages
- Market: instruments, quote, ohlc, ltp, historical pages
- Orders/Trades read-only: orders list, order history, trades pages

### UI Scope
- Navigation + module pages
- Data table components with pagination/search/filter
- Request, empty, error, retry states

### Exit Criteria
- All Phase 1 screens call real Web API endpoints
- UI renders read flows without placeholder data
- Coverage matrix updated to `Done` for Phase 1 routes

---

## Phase 2 - Trade Actions (2 weeks)
**Goal:** Add write-action UI workflows with strict validation.

### Frontend Scope
- Place/modify/cancel order
- Convert position
- Order margins, basket margins, virtual contract notes forms/views

### UI Scope
- Trade forms with strict validation
- Confirm dialogs and idempotency key handling
- User action feedback and trace-friendly error details

### Exit Criteria
- All write flows include validation and safe UX guardrails
- Negative paths handled (validation, API errors, permission issues)
- Mutation retries enabled only where safe

---

## Phase 3 - GTT + Mutual Funds (2 weeks)
**Goal:** Complete remaining domain parity in frontend.

### Frontend Scope
- GTT full CRUD screens
- MF orders full CRUD screens
- MF SIP full CRUD screens
- MF holdings and instruments views

### UI Scope
- GTT workflows (create/edit/cancel/list/detail)
- MF workflows (orders, SIPs, holdings)
- Consistent UX with existing modules

### Exit Criteria
- Full planned route coverage at UI level
- E2E tests pass for one happy + one failure path per critical flow

---

## Phase 4 - Hardening & Operational Readiness (1 week)
**Goal:** Frontend production readiness.

### Deliverables
- Bundle analysis and route-based performance optimization
- Request throttling/debouncing for market screens
- Security review (frontend secrets, storage, sanitization)
- Error monitoring setup and runbook
- Release checklist and rollback plan
- Session log completeness check under `.github/logs/`

### Exit Criteria
- Core frontend SLOs defined and measured
- Critical monitoring alerts tested
- Go-live checklist signed off
- Copilot/session execution logs stored for release traceability

---

## Parallel Track - Real-time UI Streaming
This can run after Phase 2.

### Scope
- Consume backend streaming endpoint (SignalR/WebSocket)
- Subscription management UI

### Exit Criteria
- Stable reconnect behavior
- Stable subscription management in UI

---

## Engineering Best Practices Checklist
- Vertical slice PRs (route + feature + service + tests)
- Keep feature toggles for risky write actions
- Contract tests for API client and UI screens
- No shared mutable state in global stores without clear ownership
- Strict typed API client generated from OpenAPI (recommended)
- Maintain implementation logs in `.github/logs/sessions/` for each working session

## Tracking
Use [docs/plans/02-api-ui-coverage-matrix.md](./02-api-ui-coverage-matrix.md) as the single live tracker for endpoint completion.

## UI Reference
Use [docs/plans/05-ui-reference-from-sample.md](./05-ui-reference-from-sample.md) for the sample-inspired visual direction.
