import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav>
      <Link to="/" className="logo">
        Next<span>Read</span>
      </Link>
    </nav>
  );
}
