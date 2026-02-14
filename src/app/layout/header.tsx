import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">AmoSave</div>
      <div className="app-header__status" aria-label="Market status">
        <span className="status-dot" />
        Market Open · NIFTY 50
      </div>
      <nav className="app-header__nav" aria-label="Quick links">
        <NavLink className="nav-link" to="/app/market/quotes">
          Quotes
        </NavLink>
        <NavLink className="nav-link" to="/app/orders/list">
          Order Book
        </NavLink>
      </nav>
      <div className="app-header__profile">◎</div>
    </header>
  );
}
