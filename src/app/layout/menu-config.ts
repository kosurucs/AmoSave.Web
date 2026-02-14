export type MainMenuKey = 'market' | 'trade' | 'analyse' | 'app-settings' | 'algo' | 'strategy-builder';

export type MenuTab = {
  label: string;
  path: string;
};

export type MainMenuItem = {
  key: MainMenuKey;
  title: string;
  description: string;
  defaultPath: string;
};

export const mainMenuItems: MainMenuItem[] = [
  {
    key: 'market',
    title: 'Market',
    description: 'Watchlist, positions and order overview',
    defaultPath: '/app/watchlist',
  },
  {
    key: 'trade',
    title: 'Trade',
    description: 'Order placement and execution actions',
    defaultPath: '/app/orders/place',
  },
  {
    key: 'analyse',
    title: 'Analyse',
    description: 'Quotes, historical and trigger workflows',
    defaultPath: '/app/market/quotes',
  },
  {
    key: 'app-settings',
    title: 'App Settings',
    description: 'User and system-level configurations',
    defaultPath: '/app/settings/user',
  },
  {
    key: 'algo',
    title: 'Algo',
    description: 'Strategy builder and back testing tools',
    defaultPath: '/app/algo/strategy-builder',
  },
  {
    key: 'strategy-builder',
    title: 'Stragy Builder',
    description: 'Dedicated strategy builder workspace',
    defaultPath: '/app/strategy-builder',
  },
];

export const subMenuTabsByMainMenu: Record<MainMenuKey, MenuTab[]> = {
  market: [
    { label: 'Watchlist', path: '/app/watchlist' },
    { label: 'Positions', path: '/app/positions' },
    { label: 'Orders', path: '/app/orders' },
    { label: 'Order Book', path: '/app/orders/list' },
  ],
  trade: [
    { label: 'Place Order', path: '/app/orders/place' },
    { label: 'Modify Order', path: '/app/orders/modify' },
    { label: 'Cancel Order', path: '/app/orders/cancel' },
    { label: 'Convert Position', path: '/app/portfolio/convert-position' },
  ],
  analyse: [
    { label: 'Quotes', path: '/app/market/quotes' },
    { label: 'Historical', path: '/app/market/historical' },
    { label: 'GTT', path: '/app/gtt/list' },
    { label: 'Mutual Funds', path: '/app/mf/orders' },
  ],
  'app-settings': [
    { label: 'User Setting', path: '/app/settings/user' },
    { label: 'System Settings', path: '/app/settings/system' },
  ],
  algo: [
    { label: 'Strgy Builder', path: '/app/algo/strategy-builder' },
    { label: 'Back testing', path: '/app/algo/back-testing' },
  ],
  'strategy-builder': [
    { label: 'Stragy Builder', path: '/app/strategy-builder' },
    { label: 'Back testing', path: '/app/algo/back-testing' },
  ],
};

export function getActiveMainMenu(pathname: string): MainMenuKey {
  if (pathname.startsWith('/app/settings')) {
    return 'app-settings';
  }

  if (pathname.startsWith('/app/algo')) {
    return 'algo';
  }

  if (pathname.startsWith('/app/strategy-builder')) {
    return 'strategy-builder';
  }

  if (pathname.startsWith('/app/orders/place') || pathname.startsWith('/app/orders/modify') || pathname.startsWith('/app/orders/cancel') || pathname.startsWith('/app/portfolio/convert-position')) {
    return 'trade';
  }

  if (pathname.startsWith('/app/market') || pathname.startsWith('/app/gtt') || pathname.startsWith('/app/mf')) {
    return 'analyse';
  }

  return 'market';
}
