import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userContext = useContext(UserContext);

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/users/login", {
      method: "POST",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data._id !== undefined) {
      userContext.setUserContext(data);
      window.location.href = "/";
    } else {
      setUsername("");
      setPassword("");
      setError("Invalid username or password");
    }
  }

  return (
    <section className="login-container">
      <div className="login-box">
        <h2 className="login-title">READY TO</h2>
        <h1 className="login-subtitle">LOGIN</h1>

        <form onSubmit={handleLogin} className="login-form">
          {error && <p className="login-error">{error}</p>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <button type="submit" className="login-button">Login</button>

          <p className="login-register">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;
