import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';

export default function Nav({ user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(e) {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <nav id="site-nav">
      <Link to="/" className="nav-logo">
        <img src="/logo.svg" alt="BookOtter" />
      </Link>

      <div className="nav-menu">
        <Link
          to="/"
          className={`meta-label nav-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          Discover
        </Link>

        <Link
          to="/shelf"
          className={`meta-label nav-item ${location.pathname === '/shelf' ? 'active' : ''}`}
        >
          Library
        </Link>

        <div className="nav-account" ref={popRef}>
          <button
            className="nav-avatar"
            onClick={() => setOpen(prev => !prev)}
          >
            {initials ? (
              <span className="avatar-initials">{initials}</span>
            ) : (
              <CircleUserRound size={15} strokeWidth={1.8} />
            )}
          </button>

          {open && (
            <div className="account-popover">
              {user ? (
                <>
                  <p className="micro-label">{user.displayName}</p>
                  <button
                    className="text-action"
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <p className="micro-label">Guest</p>
                  <button
                    className="text-action"
                    onClick={() => {
                      setOpen(false);
                      onLogin();
                    }}
                  >
                    Sign In with Google
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}