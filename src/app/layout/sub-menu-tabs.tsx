import { NavLink, useLocation } from 'react-router-dom';
import { getActiveMainMenu, subMenuTabsByMainMenu } from '@/app/layout/menu-config';

export function SubMenuTabs() {
  const { pathname } = useLocation();
  const activeMainMenu = getActiveMainMenu(pathname);
  const subMenuTabs = subMenuTabsByMainMenu[activeMainMenu];

  return (
    <nav className="sub-menu-tabs" aria-label="Sub menu tabs">
      {subMenuTabs.map((tab) => (
        <NavLink key={tab.path} to={tab.path} className="sub-menu-tab">
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
