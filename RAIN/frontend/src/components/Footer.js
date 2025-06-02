import { useContext } from "react";
import { UserContext } from "../userContext";

function Footer() {
  const { user } = useContext(UserContext);

  return (
    <footer className="bg-dark text-light mt-auto py-3">
      <div className="container text-center small">
        <p className="mb-1">
          © {new Date().getFullYear()} IME — All rights reserved.
        </p>
        {user && user.user_type === 1 && (
          <p className="text-muted mb-0">Admin Access Enabled</p>
        )}
      </div>
    </footer>
  );
}

export default Footer;
