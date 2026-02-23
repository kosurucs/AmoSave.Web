import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStoredAuthUserName, setStoredAuthAccessKey, setStoredAuthUserName } from '@/services/api/auth.service';

export function Header() {
  const navigate = useNavigate();
  const profileName = getStoredAuthUserName() ?? 'Guest';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setStoredAuthUserName(null);
    setStoredAuthAccessKey(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">AmoSave</div>
      <div className="app-header__status" aria-label="Market status">
        <span className="status-dot" />
        Market Open · NIFTY 50
      </div>
      <div className="app-header__profile-wrap" ref={menuRef}>
        <button
          className="app-header__profile"
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          {profileName}
        </button>
        {isMenuOpen ? (
          <div className="app-header__profile-menu" role="menu" aria-label="Profile menu">
            <NavLink className="app-header__profile-menu-item" to="/app/settings/user" role="menuitem" onClick={() => setIsMenuOpen(false)}>
              User Setting
            </NavLink>
            <NavLink className="app-header__profile-menu-item" to="/app/settings/system" role="menuitem" onClick={() => setIsMenuOpen(false)}>
              System Setting
            </NavLink>
            <button className="app-header__profile-menu-item" type="button" role="menuitem" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
