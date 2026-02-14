# AmoSave - UI Reference (Based on Shared Sample Screens)

## 1) Purpose
Define a clear UI direction for AmoSave using the shared sample screenshots as visual reference.

This is a **style and layout reference**, not an exact clone. Keep AmoSave branding, naming, and assets.

## 2) Global Visual Direction
- Dark trading dashboard theme.
- Clean top navigation with compact spacing.
- Subtle borders and low-contrast separators.
- High readability typography with medium weight labels.
- Accent color for selected menu and primary actions.

## 3) Shell Layout (Desktop First)
- Header (fixed top):
  - Left: AmoSave logo/name.
  - Center: primary menus (`Trade`, `Analyse`, `Watchlist`, `Positions`, `Orders`).
  - Right: profile icon/menu.
- Main content area:
  - Login page: two-column hero + authentication card.
  - Authenticated pages: full-width content under header.

## 4) Login Screen Pattern (From Sample)
- Left panel:
  - AmoSave welcome content.
  - 2-3 trust/value bullets.
  - Compliance/trust badge area.
- Right panel card:
  - Heading: `Login to continue`.
  - Primary CTA button for broker-based login.
  - Secondary login options stacked in equal-width rows.
  - Footer legal text (`terms and conditions`).

## 5) Top Navigation Behavior
- `Trade` and `Analyse` should open mega-menu panels.
- Mega menus are 3-column link groups with labels and optional badges (`New`, `Popular`).
- Active menu item has accent text color.
- Menu panels use same dark surface with subtle column dividers.

## 6) Component Rules
- Buttons:
  - Primary: solid accent background.
  - Secondary: transparent/dark with border.
- Cards:
  - Soft border radius, thin border, dark fill.
- Badges:
  - Small rounded chips for `New` / `Popular`.
- Icons:
  - Simple line icons, consistent size.

## 7) Branding Rules for AmoSave
- App name everywhere must be `AmoSave`.
- Use your own logo and brand icon set.
- Avoid third-party logos/text from sample in production UI.

## 8) Initial Screen List to Implement
1. `Login` (sample-inspired two-column layout)
2. `Top Nav + Mega Menu` shell
3. `Watchlist` placeholder page
4. `Positions` placeholder page
5. `Orders` placeholder page

After these, connect each page to API modules from the coverage matrix.

## 9) Acceptance Checklist
- Dark theme and spacing match sample quality.
- Navigation and mega-menu interactions are smooth.
- Login card and CTA hierarchy are clear.
- AmoSave branding is applied consistently.
- UI remains responsive at 1366px and 1536px widths.
