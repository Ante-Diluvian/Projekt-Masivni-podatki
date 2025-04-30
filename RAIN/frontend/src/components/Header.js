import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <nav className="navbar">
        <div className="navbar-brand">MyApp</div>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-link">Login</Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-link">Register</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
