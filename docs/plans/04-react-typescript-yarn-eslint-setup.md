# AmoSave.Web - React + TypeScript + Yarn + ESLint Setup Blueprint

## 1) Frontend Stack (Recommended)
- React 18+
- TypeScript 5+
- Vite 5+ (fast build + dev server)
- Yarn (classic or berry; pick one and keep consistent)
- ESLint + TypeScript ESLint + Prettier
- React Router
- Axios
- TanStack Query
- React Hook Form + Zod
- TanStack Table
- Testing Library + Vitest

## 1.1) UI Direction (AmoSave)
- Use the shared sample screenshots as UI inspiration (dark trading dashboard style).
- Keep AmoSave branding only (name/logo/colors defined by your design tokens).
- Prioritize a strong top header navigation and mega-menu interactions.

## 2) Package List

### Runtime Dependencies
- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `@tanstack/react-query`
- `@tanstack/react-table`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `clsx`

### Dev Dependencies
- `typescript`
- `vite`
- `@vitejs/plugin-react`
- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `eslint-config-prettier`
- `prettier`
- `vite-tsconfig-paths`
- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `msw`

### Optional (Useful at scale)
- `@tanstack/react-query-devtools`
- `eslint-plugin-import`
- `eslint-plugin-unused-imports`
- `husky`
- `lint-staged`

## 3) Yarn Commands

```bash
# create app
yarn create vite amosave-web --template react-ts

# runtime deps
yarn add react react-dom react-router-dom axios @tanstack/react-query @tanstack/react-table react-hook-form zod @hookform/resolvers clsx

# dev deps
yarn add -D typescript vite @vitejs/plugin-react @eslint/js typescript-eslint eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier prettier vite-tsconfig-paths vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw

# optional
yarn add -D @tanstack/react-query-devtools eslint-plugin-import eslint-plugin-unused-imports husky lint-staged
```

## 4) Recommended Folder Structure

```text
src/
  app/
    providers/
      query-provider.tsx
      router-provider.tsx
    router/
      index.tsx
      routes.tsx
    layout/
      app-shell.tsx
      sidebar.tsx
      header.tsx
    config/
      env.ts
      constants.ts
    styles/
      globals.css
      theme.css

  features/
    auth/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
    user/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
    orders/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
    portfolio/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
    market/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
    gtt/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
    mutual-funds/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/

  services/
    http/
      axios-client.ts
      interceptors.ts
      error-mapper.ts
    api/
      auth.service.ts
      user.service.ts
      orders.service.ts
      portfolio.service.ts
      market.service.ts
      gtt.service.ts
      mutual-funds.service.ts

  shared/
    components/
      ui/
      table/
      form/
      feedback/
    hooks/
      use-debounce.ts
      use-paginated-query.ts
    lib/
      query-keys.ts
      formatters.ts
      guards.ts
    types/
      api.ts
      common.ts
    constants/
      routes.ts
      messages.ts

  test/
    setup.ts
    mocks/
      handlers.ts
      server.ts

  main.tsx
```

## 5) API Calling Pattern (Frontend)
- Keep one Axios instance in `services/http/axios-client.ts`.
- Add interceptors for:
  - auth/session handling
  - error normalization
  - request correlation headers (if required by backend)
- Expose domain methods through `services/api/*`.
- Use TanStack Query hooks inside feature hooks only.

## 6) ESLint/Formatting Standards
- Enforce no unused imports/variables.
- Enforce strict TypeScript (no `any` by default).
- Keep import grouping and path aliases (`@/features/...`).
- Run lint and tests in CI for each pull request.

## 7) Minimum Scripts (package.json)
- `dev`: start Vite dev server
- `build`: production build
- `preview`: preview build
- `typecheck`: TypeScript check
- `lint`: ESLint run
- `test`: Vitest run
- `test:watch`: Vitest watch mode

## 8) Implementation Order (Frontend Only)
1. Bootstrap app shell, routing, API client, query provider.
2. Implement header + mega-menu + login layout from UI reference.
3. Build read-only modules first (User, Portfolio, Market, Orders list).
4. Build write modules (Order actions, position convert, margins forms).
5. Build GTT and MF modules.
6. Add streaming UI integration.
7. Harden with test coverage and performance tuning.

## 9) Non-Negotiables
- Components do not call Axios directly.
- Forms must use schema validation.
- Every page has loading/empty/error state.
- Avoid giant shared state; prefer query cache + local state.
- Keep application naming as `AmoSave` in all UI text and metadata.
