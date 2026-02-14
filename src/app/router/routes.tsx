import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/layout/app-shell';
import { LoginPage } from '@/features/auth/pages/login-page';
import { WatchlistPage } from '@/features/system/pages/watchlist-page';
import { PositionsHomePage } from '@/features/system/pages/positions-home-page';
import { OrdersHomePage } from '@/features/system/pages/orders-home-page';
import { UserSettingsPage } from '@/features/system/pages/user-settings-page';
import { SystemSettingsPage } from '@/features/system/pages/system-settings-page';
import { StrategyBuilderPage } from '@/features/algo/pages/strategy-builder-page';
import { BackTestingPage } from '@/features/algo/pages/back-testing-page';
import { ProfilePage } from '@/features/user/pages/profile-page';
import { MarginsPage } from '@/features/user/pages/margins-page';
import { PortfolioPositionsPage } from '@/features/portfolio/pages/portfolio-positions-page';
import { PortfolioHoldingsPage } from '@/features/portfolio/pages/portfolio-holdings-page';
import { PortfolioAuctionsPage } from '@/features/portfolio/pages/portfolio-auctions-page';
import { ConvertPositionPage } from '@/features/portfolio/pages/convert-position-page';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderHistoryPage } from '@/features/orders/pages/order-history-page';
import { TradesPage } from '@/features/orders/pages/trades-page';
import { PlaceOrderPage } from '@/features/orders/pages/place-order-page';
import { ModifyOrderPage } from '@/features/orders/pages/modify-order-page';
import { CancelOrderPage } from '@/features/orders/pages/cancel-order-page';
import { InstrumentsPage } from '@/features/market/pages/instruments-page';
import { QuotesPage } from '@/features/market/pages/quotes-page';
import { HistoricalPage } from '@/features/market/pages/historical-page';
import { TriggerRangePage } from '@/features/market/pages/trigger-range-page';
import { OrderMarginPage } from '@/features/margins/pages/order-margin-page';
import { BasketMarginPage } from '@/features/margins/pages/basket-margin-page';
import { ContractNotesPage } from '@/features/margins/pages/contract-notes-page';
import { GttListPage } from '@/features/gtt/pages/gtt-list-page';
import { GttDetailPage } from '@/features/gtt/pages/gtt-detail-page';
import { GttCreatePage } from '@/features/gtt/pages/gtt-create-page';
import { GttModifyPage } from '@/features/gtt/pages/gtt-modify-page';
import { GttCancelPage } from '@/features/gtt/pages/gtt-cancel-page';
import { MfInstrumentsPage } from '@/features/mutual-funds/pages/mf-instruments-page';
import { MfHoldingsPage } from '@/features/mutual-funds/pages/mf-holdings-page';
import { MfOrdersPage } from '@/features/mutual-funds/pages/mf-orders-page';
import { MfOrderDetailPage } from '@/features/mutual-funds/pages/mf-order-detail-page';
import { MfPlaceOrderPage } from '@/features/mutual-funds/pages/mf-place-order-page';
import { MfCancelOrderPage } from '@/features/mutual-funds/pages/mf-cancel-order-page';
import { MfSipsPage } from '@/features/mutual-funds/pages/mf-sips-page';
import { MfSipDetailPage } from '@/features/mutual-funds/pages/mf-sip-detail-page';
import { MfCreateSipPage } from '@/features/mutual-funds/pages/mf-create-sip-page';
import { MfModifySipPage } from '@/features/mutual-funds/pages/mf-modify-sip-page';
import { MfCancelSipPage } from '@/features/mutual-funds/pages/mf-cancel-sip-page';

export const routes = [
  { path: '/', element: <LoginPage /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { path: 'watchlist', element: <WatchlistPage /> },
      { path: 'positions', element: <PositionsHomePage /> },
      { path: 'orders', element: <OrdersHomePage /> },
      { path: 'settings/user', element: <UserSettingsPage /> },
      { path: 'settings/system', element: <SystemSettingsPage /> },
      { path: 'algo/strategy-builder', element: <StrategyBuilderPage /> },
      { path: 'algo/back-testing', element: <BackTestingPage /> },
      { path: 'strategy-builder', element: <StrategyBuilderPage /> },
      { path: 'user/profile', element: <ProfilePage /> },
      { path: 'user/margins', element: <MarginsPage /> },
      { path: 'portfolio/positions', element: <PortfolioPositionsPage /> },
      { path: 'portfolio/holdings', element: <PortfolioHoldingsPage /> },
      { path: 'portfolio/auctions', element: <PortfolioAuctionsPage /> },
      { path: 'portfolio/convert-position', element: <ConvertPositionPage /> },
      { path: 'orders/list', element: <OrdersPage /> },
      { path: 'orders/history', element: <OrderHistoryPage /> },
      { path: 'orders/trades', element: <TradesPage /> },
      { path: 'orders/place', element: <PlaceOrderPage /> },
      { path: 'orders/modify', element: <ModifyOrderPage /> },
      { path: 'orders/cancel', element: <CancelOrderPage /> },
      { path: 'market/instruments', element: <InstrumentsPage /> },
      { path: 'market/quotes', element: <QuotesPage /> },
      { path: 'market/historical', element: <HistoricalPage /> },
      { path: 'market/trigger-range', element: <TriggerRangePage /> },
      { path: 'margins/order', element: <OrderMarginPage /> },
      { path: 'margins/basket', element: <BasketMarginPage /> },
      { path: 'margins/contract-notes', element: <ContractNotesPage /> },
      { path: 'gtt/list', element: <GttListPage /> },
      { path: 'gtt/detail', element: <GttDetailPage /> },
      { path: 'gtt/create', element: <GttCreatePage /> },
      { path: 'gtt/modify', element: <GttModifyPage /> },
      { path: 'gtt/cancel', element: <GttCancelPage /> },
      { path: 'mf/instruments', element: <MfInstrumentsPage /> },
      { path: 'mf/holdings', element: <MfHoldingsPage /> },
      { path: 'mf/orders', element: <MfOrdersPage /> },
      { path: 'mf/orders/detail', element: <MfOrderDetailPage /> },
      { path: 'mf/orders/place', element: <MfPlaceOrderPage /> },
      { path: 'mf/orders/cancel', element: <MfCancelOrderPage /> },
      { path: 'mf/sips', element: <MfSipsPage /> },
      { path: 'mf/sips/detail', element: <MfSipDetailPage /> },
      { path: 'mf/sips/create', element: <MfCreateSipPage /> },
      { path: 'mf/sips/modify', element: <MfModifySipPage /> },
      { path: 'mf/sips/cancel', element: <MfCancelSipPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
