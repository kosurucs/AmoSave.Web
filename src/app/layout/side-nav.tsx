import { NavLink, useLocation } from 'react-router-dom';
import { getActiveMainMenu, mainMenuItems } from '@/app/layout/menu-config';

export function SideNav() {
  const { pathname } = useLocation();
  const activeMainMenu = getActiveMainMenu(pathname);

  return (
    <aside className="side-nav">
      <h2 className="side-nav__group-title">Main Menus</h2>
      <div className="side-nav__items">
        {mainMenuItems.map((menu) => (
          <NavLink
            key={menu.key}
            to={menu.defaultPath}
            className={`side-nav__item ${activeMainMenu === menu.key ? 'active' : ''}`}
          >
            <div className="side-nav__title-row">
              <span className="side-nav__title">{menu.title}</span>
            </div>
            <span className="side-nav__description">{menu.description}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
