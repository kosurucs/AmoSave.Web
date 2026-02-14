# AmoSave.Web - API to UI Coverage Matrix

This matrix is the source of truth for endpoint coverage.

## Status Key
- `Planned` = included in roadmap
- `In Progress` = implementation started
- `Done` = frontend UI + API integration + tests complete

## Ownership & QA Fields
Use these fields while execution starts:
- `Owner` (developer responsible)
- `QA` (test owner)
- `Last Updated` (YYYY-MM-DD)

## A) Session / Auth

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/session/token` | `POST /api/v1/auth/session` | Auth > Connect Account | Exchange request token for access token | Planned |
| `/session/refresh_token` | `POST /api/v1/auth/refresh` | Auth > Session Manager | Refresh and renew session | Planned |

## B) User

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/user/profile` | `GET /api/v1/user/profile` | User > Profile | Basic user details | Planned |
| `/user/margins` | `GET /api/v1/user/margins` | User > Margins | All segments | Planned |
| `/user/margins/{segment}` | `GET /api/v1/user/margins/{segment}` | User > Margins | Segment filter | Planned |

## C) Orders, Trades, Margins

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/orders` | `GET /api/v1/orders` | Orders > Order Book | List all orders | Planned |
| `/orders/{order_id}` | `GET /api/v1/orders/{orderId}/history` | Orders > Order Details | Order timeline | Planned |
| `/orders/{variety}` | `POST /api/v1/orders` | Orders > Place Order | Create order | Planned |
| `/orders/{variety}/{order_id}` (PUT) | `PUT /api/v1/orders/{orderId}` | Orders > Modify Order | Update open order | Planned |
| `/orders/{variety}/{order_id}` (DELETE) | `DELETE /api/v1/orders/{orderId}` | Orders > Cancel Order | Cancel order | Planned |
| `/trades` | `GET /api/v1/trades` | Trades > Day Trades | All trades | Planned |
| `/orders/{order_id}/trades` | `GET /api/v1/orders/{orderId}/trades` | Orders > Trade Fills | Trades for order | Planned |
| `/margins/orders` | `POST /api/v1/margins/orders` | Margins > Order Margin | Margin preview | Planned |
| `/margins/basket` | `POST /api/v1/margins/basket` | Margins > Basket Margin | Basket estimate | Planned |
| `/charges/orders` | `POST /api/v1/charges/orders` | Charges > Contract Notes | Virtual contract notes | Planned |

## D) Portfolio

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/portfolio/positions` (GET) | `GET /api/v1/portfolio/positions` | Portfolio > Positions | Day and net positions | Planned |
| `/portfolio/holdings` | `GET /api/v1/portfolio/holdings` | Portfolio > Holdings | Equity holdings | Planned |
| `/portfolio/positions` (PUT) | `PUT /api/v1/portfolio/positions/convert` | Portfolio > Convert Position | Product conversion | Planned |
| `/portfolio/holdings/auctions` | `GET /api/v1/portfolio/holdings/auctions` | Portfolio > Auctions | Auction instruments | Planned |

## E) Market Data

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/instruments` | `GET /api/v1/market/instruments` | Market > Instruments | Large response, paging/search on UI | Planned |
| `/instruments/{exchange}` | `GET /api/v1/market/instruments/{exchange}` | Market > Instruments | Exchange filter | Planned |
| `/quote` | `GET /api/v1/market/quote` | Market > Quotes | Up to 200 instruments | Planned |
| `/quote/ohlc` | `GET /api/v1/market/ohlc` | Market > OHLC | Compact quote view | Planned |
| `/quote/ltp` | `GET /api/v1/market/ltp` | Market > LTP | Price snapshots | Planned |
| `/instruments/historical/{instrument_token}/{interval}` | `GET /api/v1/market/historical` | Market > Historical | Candles and chart | Planned |
| `/instruments/trigger_range/{transaction_type}` | `GET /api/v1/market/trigger-range` | Market > Trigger Range | CO trigger ranges | Planned |

## F) GTT

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/gtt/triggers` (GET) | `GET /api/v1/gtt` | GTT > List | All triggers | Done |
| `/gtt/triggers/{id}` (GET) | `GET /api/v1/gtt/{id}` | GTT > Detail | Single trigger | Done |
| `/gtt/triggers` (POST) | `POST /api/v1/gtt` | GTT > Create | Place GTT | Done |
| `/gtt/triggers/{id}` (PUT) | `PUT /api/v1/gtt/{id}` | GTT > Modify | Update GTT | Done |
| `/gtt/triggers/{id}` (DELETE) | `DELETE /api/v1/gtt/{id}` | GTT > Cancel | Cancel GTT | Done |

## G) Mutual Funds

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/mf/instruments` | `GET /api/v1/mf/instruments` | MF > Instruments | Fund master list | Done |
| `/mf/orders` (GET) | `GET /api/v1/mf/orders` | MF > Orders | MF orders list | Done |
| `/mf/orders/{order_id}` (GET) | `GET /api/v1/mf/orders/{orderId}` | MF > Order Detail | Single order detail | Done |
| `/mf/orders` (POST) | `POST /api/v1/mf/orders` | MF > Place Order | Place MF order | Done |
| `/mf/orders/{order_id}` (DELETE) | `DELETE /api/v1/mf/orders/{orderId}` | MF > Cancel Order | Cancel MF order | Done |
| `/mf/sips` (GET) | `GET /api/v1/mf/sips` | MF > SIPs | List SIPs | Done |
| `/mf/sips/{sip_id}` (GET) | `GET /api/v1/mf/sips/{sipId}` | MF > SIP Detail | SIP detail | Done |
| `/mf/sips` (POST) | `POST /api/v1/mf/sips` | MF > Create SIP | Place SIP | Done |
| `/mf/sips/{sip_id}` (PUT) | `PUT /api/v1/mf/sips/{sipId}` | MF > Modify SIP | Update SIP | Done |
| `/mf/sips/{sip_id}` (DELETE) | `DELETE /api/v1/mf/sips/{sipId}` | MF > Cancel SIP | Cancel SIP | Done |
| `/mf/holdings` | `GET /api/v1/mf/holdings` | MF > Holdings | MF holdings | Done |

## H) Misc

| DotNetKite Route | Internal API (proposed) | UI Module/Page | Notes | Status |
|---|---|---|---|---|
| `/parameters` | `GET /api/v1/system/parameters` | System > Diagnostics | Optional admin/diagnostic use | Planned |

## I) Real-time (Non-HTTP)
`dotnetkiteconnect` includes WebSocket ticker support. Treat this as a separate track after HTTP route parity.

Suggested internal endpoint strategy:
- Backend keeps ticker connection and broadcasts via SignalR/WebSocket to UI.
- Do not connect browser directly to third-party ticker with secrets.
