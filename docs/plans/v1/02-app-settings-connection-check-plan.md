# AmoSave.Web - V1 App Settings Connection Check Plan

## 1) Goal
Add a new tab under **App Settings** called **Connection Check** to validate API connectivity using the Health endpoint and clearly show connected/failed state with response details.

This is a planning document only (no code changes in this phase).

## 2) Current State (Observed)
- App Settings currently has tabs:
  - User Setting (`/app/settings/user`)
  - System Settings (`/app/settings/system`)
- Existing `SystemSettingsPage` already includes:
  - API base URL input
  - Save/Reset controls
  - Basic "Test Health Endpoint" action
  - Minimal success/failure text message

## 3) Target UX (Requested)
Create a dedicated **Connection Check** tab in App Settings where user can:
1. See available local URLs (pre-populated list).
2. Select or enter a URL to test.
3. Click one **Connect / Check Connection** button.
4. See connection status: Connected / Not Connected.
5. If failed, see Health API response details in a lower error panel.

## 4) Functional Requirements

### 4.1 Navigation & Placement
- Add new App Settings tab label: `Connection Check`.
- Route proposal: `/app/settings/connection-check`.
- Keep existing User/System tabs unchanged.

### 4.2 URL Sources
- Show a "Local URL candidates" list (editable selection list), initial seed values:
  - `http://localhost:5000/api/v1`
  - `http://localhost:5208/api/v1`
  - Current stored API base URL (if different)
- Allow user to manually type a custom URL.
- Normalize URL before request (trim whitespace, remove trailing spaces).

### 4.3 Connection Action
- Single primary button: `Check Connection`.
- Endpoint to validate: `GET {baseUrl}/Health`.
- During check:
  - Disable button
  - Show checking state text/spinner style already used in design system

### 4.4 Success Criteria
Connection is considered **Connected** when:
- HTTP status is `2xx`, and
- Response envelope indicates usable payload (`success === true` preferred), and
- Health data object exists.

### 4.5 Failure Handling
Connection is **Not Connected** when:
- Network error / CORS / DNS / timeout, or
- Non-2xx status, or
- 2xx but invalid/empty health payload.

### 4.6 Failure Details Panel
On failure, render a detail panel below status with:
- Checked URL
- Failure type (network/http/payload)
- Status code + status text (if available)
- API response body preview (raw JSON/text, truncated if large)
- Timestamp of check

## 5) State Model (Planning)

### 5.1 UI State
- `selectedUrl: string`
- `isChecking: boolean`
- `lastCheckedAt?: string`
- `result: 'idle' | 'connected' | 'failed'`
- `healthPayload?: unknown`
- `failureDetails?: { type; statusCode?; statusText?; responseBody?; message }`

### 5.2 Persistence
- Optional: persist last selected URL in local storage.
- Do not auto-overwrite global API base URL unless user explicitly confirms (separate action if needed).

## 6) API Contract Used
- Health endpoint: `GET /api/v1/Health`
- Expected success schema: `HealthResponseApiResponse`
  - envelope: `success`, `data`, `error`, `timestamp`
  - `data` fields include: `status`, `service`, `version`, `environment`, `uptime`, `dependencies`

## 7) Proposed File-Level Implementation Plan (Next Phase)

### 7.1 Routing & Menu
- Update app settings submenu configuration to include `Connection Check`.
- Add route entry for `/app/settings/connection-check`.

### 7.2 New Page
- Create dedicated page component for connection diagnostics under system feature pages.
- Move health-check-specific logic from `SystemSettingsPage` to this new page.

### 7.3 Service Layer
- Add (or reuse) typed health service call in `src/services/api`.
- Return typed envelope + preserve error response payload for diagnostics.

### 7.4 Error Mapping
- Extend HTTP error mapping to expose:
  - status code
  - response body
  - network failure reason
- Keep user-friendly message plus raw detail block for troubleshooting.

### 7.5 UI Presentation
- Use existing design system primitives only (`page-card`, `input`, `select`, `btn`, helper/error text).
- Add explicit Connected/Not Connected indicator text.
- Add details panel shown only on failure.

## 8) Acceptance Criteria
1. New `Connection Check` tab appears under App Settings.
2. User can choose local URL or type custom URL.
3. Clicking `Check Connection` calls `GET {baseUrl}/Health`.
4. UI shows Connected/Not Connected clearly.
5. On failure, detailed Health/API response appears below.
6. No unrelated feature behavior changes.

## 9) Edge Cases to Cover
- Empty URL input
- Invalid URL format
- API running but endpoint path mismatch
- API returns HTML/non-JSON error payload
- Slow API / timeout
- CORS-blocked request

## 10) Delivery Sequence (Execution Order)
1. Routing/tab update.
2. New Connection Check page scaffold.
3. Typed health service + error shape mapping.
4. Connection check action + state machine.
5. Failure detail panel rendering.
6. Manual verification with working and failing localhost URLs.
