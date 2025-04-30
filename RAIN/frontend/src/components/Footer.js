import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Footer() {

  return (
    <footer className="bg-light text-center text-lg-start mt-auto border-top">

      <div className="text-center py-3 bg-light border-top small text-muted">
        © 2025 Copyright: <a className="text-decoration-none text-reset" href="#">Nekaj</a>
      </div>
    </footer>
  );
}

export default Footer;
