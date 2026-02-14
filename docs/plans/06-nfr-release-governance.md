# AmoSave.Web - NFR & Release Governance

## 1) Non-Functional Requirements (NFRs)

### 1.1 Performance Targets
- First load (dashboard shell): target under 3s on standard broadband.
- Route transitions: target under 500ms for cached data routes.
- API request timeout at client layer: 15s default (override per endpoint type).

### 1.2 Reliability Targets
- Graceful handling for API errors, network failures, and timeouts.
- No blank screens on failure; always render fallback state.
- Retry policy only for safe, idempotent requests.

### 1.3 Security Targets
- No API secrets in frontend environment variables.
- No token or PII values in browser console logs.
- Strict handling of unauthorized responses (session reset + re-login flow).

### 1.4 Accessibility Targets
- Keyboard-accessible primary navigation and forms.
- Semantic structure for core pages.
- WCAG AA contrast for text and key controls.

## 2) Release Readiness Checklist
- All planned routes in current release marked `Done` in coverage matrix.
- Critical flows tested (login, orders read, one write flow, logout/session-expiry).
- Lint, typecheck, unit tests, and smoke tests pass.
- Error monitoring and diagnostics toggles validated.
- Session execution logs updated under `.github/logs/sessions/`.

## 3) Rollback Strategy
- Keep each release deployable by version tag.
- For severe regressions, rollback to previous stable artifact.
- Maintain release notes with known issues and mitigation.

## 4) Decision Log Rules
- Record major architecture/scope decisions in this file.
- Each entry should include:
  - Date
  - Decision
  - Reason
  - Impact

## 5) Decision Entries

### 2026-02-14
- Decision: Frontend-only scope in this repository.
- Reason: Backend/Web API is external and separately managed.
- Impact: All planning, quality gates, and delivery phases focus on React UI implementation.

### 2026-02-14
- Decision: Sample screenshots used as visual reference, not direct clone.
- Reason: Preserve AmoSave identity and avoid third-party brand dependence.
- Impact: UI follows dark dashboard pattern with AmoSave branding.
