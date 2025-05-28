import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Header() {
  const context = useContext(UserContext);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">IME</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <UserContext.Consumer>
                        {context => (
                            context.user ?
                                <div className="navbar-nav  ml-auto">
                                    <li><Link className="nav-link" to='/recipes'>Recipes</Link></li>
                                    <li><Link className="nav-link" to='/statistics'>Statistics</Link></li>
                                    <li><Link className="nav-link" to='/profile'>Profile</Link></li>
                                    <li><Link className="nav-link" to='/logout'>Logout</Link></li>
                                </div>
                            :
                                <div className="navbar-nav  ml-auto">
                                    <li><Link className="nav-link" to='/login'>Login</Link></li>
                                    <li><Link className="nav-link" to='/register'>Register</Link></li>
                                </div>

                        )}
                    </UserContext.Consumer>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}export default Header;
