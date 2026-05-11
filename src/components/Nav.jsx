import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <nav>
      <Link to="/" className="logo">
        Next<span>Read</span>
      </Link>

      <div className="menu">
        <Link to="/shelf" className={`menu-link${pathname === '/shelf' ? ' active' : ''}`}>
          Bookshelf
        </Link>
      </div>
    </nav>
  );
}