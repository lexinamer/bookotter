import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';

export default function Nav({ user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav id="site-nav">
      <Link to="/" className="nav-logo">
        <img src="/logo.svg" alt="BookOtter" />
      </Link>

      <div className="nav-menu">
        <Link to="/shelf" className="nav-link">
          My Shelf
        </Link>

        <div className="nav-account" ref={popRef}>
          <button
            className="nav-avatar"
            onClick={() => setOpen(prev => !prev)}
          >
            <CircleUserRound size={15} strokeWidth={1.8} />
          </button>

          {open && (
            <div className="account-popover">
              {user ? (
                <>
                  <p className="account-status">Signed In</p>
                  <button
                    className="account-action"
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
                  <p className="account-status">Guest</p>
                  <button
                    className="account-action"
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
