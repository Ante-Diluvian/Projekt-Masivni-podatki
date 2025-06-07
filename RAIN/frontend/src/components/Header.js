import { useContext, useState } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Header() {
  const { user } = useContext(UserContext);
  const [collapsed, setCollapsed] = useState(true);

  const toggleNavbar = () => setCollapsed(!collapsed);
  const closeNavbar = () => setCollapsed(true);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold fs-4 text-danger" to="/">IME</Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleNavbar}
            aria-expanded={!collapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`} id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2 align-items-center">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/" onClick={closeNavbar}>Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/recipes" onClick={closeNavbar}>Recipes</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/statistics" onClick={closeNavbar}>Workouts</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile" onClick={closeNavbar}>Profile</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-danger" to="/logout" onClick={closeNavbar}>Logout</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login" onClick={closeNavbar}>Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register" onClick={closeNavbar}>Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;