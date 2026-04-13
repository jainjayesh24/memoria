import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-dot" />
        MEMORIA
      </Link>

      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>
        <button
          className="nav-study-btn"
          onClick={() => navigate('/study')}
        >
          ⚡ Study All
        </button>
      </div>
    </nav>
  );
}
