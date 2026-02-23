# AmoSave.Web - V1 User Menu + User-Auth Integration Plan

## 1) Objective
Add a new main menu item called **User** and integrate user-auth endpoints in a stable, phased way.

This document is planning-only (no implementation in this phase).

## 2) Live Endpoint Contracts (Validated)
Source validation date: 2026-02-23 (localhost runtime checks)

### A) Login
- Endpoint: `POST /api/v1/user-auth/login`
- Purpose: Login with username/password
- Request body (required):
  - `username: string`
  - `password: string`
- Sample success response (`200`):
  - `success: true`
  - `data.username: string`
  - `data.role: string`
  - `data.accessToken: string` (currently used as accessKey for roles)
  - `data.refreshToken: string`
  - `data.expiresIn: number`
  - `error: null`
  - `timestamp: string`
- Sample failure response:
  - Envelope with `success: false`, `error.code`, `error.message`

### B) Roles
- Endpoint: `GET /api/v1/user-auth/roles`
- Purpose: Get username, roles, permissions
- Request format (validated):
  - Query parameter: `accessKey=<value>`
  - `accessKey` must be the login `data.accessToken`
- Sample success response (`200`):
  - `success: true`
  - `data.username: string`
  - `data.roles: string[]`
  - `data.permissions: string[]`
  - `error: null`
  - `timestamp: string`
- Sample failure response (`401`):
  - `success: false`
  - `data: null`
  - `error.code: AUTHENTICATION_FAILED`
  - `error.message: Invalid or expired access key`

## 3) New User Menu Scope
Current main menus: Market, Trade, Analyse, App Settings, Algo, Strategy Builder.

Proposed new main menu:
- Key: `user`
- Title: `User`
- Description: `Profile, margins, and access roles`
- Default path: `/app/user/profile`

Proposed User sub-tabs:
1. `Profile` -> `/app/user/profile`
2. `Margins` -> `/app/user/margins`
3. `Roles` -> `/app/user/roles` (new page)

## 4) UI/Route Plan
### 4.1 Routing
- Add route for new page:
  - `/app/user/roles`
- Reuse existing pages:
  - `/app/user/profile`
  - `/app/user/margins`

### 4.2 Navigation
- Add `user` to main menu config.
- Add `user` entry in submenu tab map.
- Update active menu resolver to return `user` for `/app/user/*` paths.

## 5) Service Layer Plan
### 5.1 auth service updates
- Keep `login(username, password)` as primary auth entry.
- Re-enable and use `getRoles(accessKey)`.
- Add strict response typing for:
  - `LoginResponseData`
  - `RolesResponseData`

### 5.2 storage strategy
Store these keys after successful login:
- `authUserName`
- `authRole`
- `authAccessKey` (from login response `accessToken`)
- `authExpiresIn`

Clear all on logout.

## 6) Roles Page Plan
Create a new page to visualize role payload.

Page behavior:
1. Read access key from storage.
2. Call `GET /user-auth/roles?accessKey=...`.
3. Render loading/error/success via existing AsyncState pattern.
4. Show:
   - Username
   - Role list
   - Permission list

Failure behavior:
- On `401`, show API error text and suggest re-login.

## 7) Error & Reliability Plan
- Normalize endpoint errors into existing error mapper.
- Prefer backend message when available.
- Handle these states explicitly:
  - Missing access key
  - Expired access key (401)
  - Network errors
  - Unexpected response shape

## 8) Security Plan (Current Phase)
- Keep this lightweight for now:
  - localStorage for access key in MVP
  - no token refresh flow in this phase
- Next phase:
  - move to safer token strategy and refresh logic

## 9) Implementation Phases
### Phase 1 - Navigation and route shell
- Add `User` main menu and user sub-tabs
- Add `/app/user/roles` route + placeholder page

### Phase 2 - endpoint integration
- Add typed auth contracts
- Persist access key/role after login
- Implement roles API call in service

### Phase 3 - UI and behavior
- Build Roles page with AsyncState + JsonView/list blocks
- Handle missing/expired access key states
- Ensure logout clears auth data

### Phase 4 - validation
- Manual checks:
  - Login success with default credentials
  - Roles success after login
  - Roles 401 when access key invalid
  - User menu routing works

## 10) Acceptance Criteria
1. A new **User** main menu is available and active on `/app/user/*`.
2. Profile and Margins remain accessible under User tabs.
3. Roles tab calls `/user-auth/roles` with `accessKey` and displays roles/permissions.
4. Error scenarios show meaningful messages.
5. Logout clears auth storage and roles endpoint no longer works until re-login.

## 11) Open Questions (Before Build)
1. Should `accessToken` always be treated as `accessKey`, or do you plan to return a separate key later?
2. Should Roles page be visible for Guest mode or only for logged users?
3. Do you want role/permission badges list UI or raw JSON view in MVP?
