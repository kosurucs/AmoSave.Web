import { Outlet } from 'react-router-dom';
import { Header } from '@/app/layout/header';
import { SideNav } from '@/app/layout/side-nav';
import { SubMenuTabs } from '@/app/layout/sub-menu-tabs';

export function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-main-layout">
        <SideNav />
        <main className="app-content">
          <SubMenuTabs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
