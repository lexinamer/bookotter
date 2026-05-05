import { Link, useLocation } from 'react-router-dom';

export default function Nav({ user, onLogin, onLogout }) {
  const { pathname } = useLocation();

  return (
    <nav className="site-nav">
      <Link to="/" className="nav-logo">
        <img src="/logo.svg" alt="NextRead" />
      </Link>

      <div className="nav-actions">
        <Link to="/shelf" className={`nav-link${pathname === '/shelf' ? ' active' : ''}`}>
          Bookshelf
        </Link>

        <button className="nav-link" onClick={user ? onLogout : onLogin}>
          {user ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    </nav>
  );
}