import { Link } from 'react-router-dom';

export default function Nav({ user, onLogin, onLogout, onShelfOpen }) {
  return (
    <nav className="site-nav">
      <Link to="/" className="nav-logo">
        <img src="/logo.svg" alt="NextRead" />
      </Link>

      <div className="nav-right">
        <button className="nav-link" onClick={onShelfOpen}>
          My Bookshelf
        </button>
        <span className="nav-divider">|</span>
        <button className="nav-link" onClick={user ? onLogout : onLogin}>
          {user ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    </nav>
  );
}
