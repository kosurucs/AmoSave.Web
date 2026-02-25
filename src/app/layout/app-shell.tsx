import { Outlet } from 'react-router-dom';
import { TopNav } from '@/app/layout/top-nav';

export function AppShell() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
