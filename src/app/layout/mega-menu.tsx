import { NavLink } from 'react-router-dom';

type MenuItem = {
  title: string;
  description: string;
  badge?: string;
  path?: string;
};

type Props = {
  title: string;
  items: MenuItem[];
};

export function MegaMenu({ title, items }: Props) {
  return (
    <div className="mega-menu" role="menu" aria-label={`${title} menu`}>
      <div className="mega-menu__column">
        {items.map((item) => (
          item.path ? (
            <NavLink key={item.title} to={item.path} className="mega-menu__item">
              <div className="mega-menu__title-row">
                <span className="mega-menu__title">{item.title}</span>
                {item.badge ? <span className="badge">{item.badge}</span> : null}
              </div>
              <p className="mega-menu__description">{item.description}</p>
            </NavLink>
          ) : (
            <div key={item.title} className="mega-menu__item">
              <div className="mega-menu__title-row">
                <span className="mega-menu__title">{item.title}</span>
                {item.badge ? <span className="badge">{item.badge}</span> : null}
              </div>
              <p className="mega-menu__description">{item.description}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
