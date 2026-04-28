export default function Nav() {
  return (
    <nav id="site-nav">
      <a href="/" className="nav-logo">
        <img src="/logo.svg" alt="BookOtter" />
      </a>

      <div className="nav-menu">
        <a href="#" className="nav-link">My Shelf</a>
        <button className="nav-link">Account</button>
      </div>
    </nav>
  );
}