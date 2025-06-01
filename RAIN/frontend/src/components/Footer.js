import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Footer() {
  const { user } = useContext(UserContext);

  return (
<footer className=" bg-dark footer-custom mt-auto">
  <div className="container text-center py-2">
    <p className="mb-2 text-muted small">© 2025</p>
   <ul className="nav justify-content-center">
              {user ? (
                <>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/recipes">Recipes</Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/statistics">Statistics</Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/profile">Profile</Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-danger" to="/logout">Logout</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/login">Login</Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/register">Register</Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/Admin">Admin</Link>
                  </li>
                </>
              )}
            </ul>
  </div>
</footer>
  );
}

export default Footer;
