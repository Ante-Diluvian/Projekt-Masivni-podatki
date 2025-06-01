import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Admin() {
  const { user } = useContext(UserContext);

  return (
    <footer className="bg-light text-center text-lg-start mt-auto border-top">

      <div className="text-center py-3 bg-light border-top small text-muted">
        © 2025 Copyright: Nekaj
        <hr/>

      </div>
    </footer>
  );
}

export default Admin;
