import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Nav({ user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav id="site-nav">
      <Link to="/" className="nav-logo">
        <img src="/logo.svg" alt="BookOtter" />
      </Link>

      <div className="nav-menu">
        <Link to="/shelf" className="nav-link">My Shelf</Link>

        <div style={{ position: 'relative' }}>
          <button
            className="nav-link"
            onClick={() => setOpen(prev => !prev)}
          >
            {user ? 'Account' : 'Sign In'}
          </button>

          {open && (
            <div
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: 0,
                background: 'white',
                border: '1px solid var(--border)',
                padding: '0.8rem 1rem',
                minWidth: '150px',
                zIndex: 500
              }}
            >
              {user ? (
                <button className="nav-link" onClick={onLogout}>
                  Sign Out
                </button>
              ) : (
                <button className="nav-link" onClick={onLogin}>
                  Sign In with Google
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}