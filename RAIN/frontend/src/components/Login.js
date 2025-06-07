import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const userContext = useContext(UserContext);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setIsSubmitting(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  async function Login(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setCountdown(30); 

    try {
      const res = await fetch("http://localhost:3001/users/login2fa", {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!data || !data._id) {
        setError(data.message || "Invalid username or password");
        setUsername("");
        setPassword("");
        setCountdown(0);
      } else {
        userContext.setUserContext(data);
        window.location.href = "/";
      }
    } catch (err) {
      setError("An error occurred during login.");
      console.error(err);
      setCountdown(0);
    }
  }

  return (
    <section className="login-container">
      <div className="login-box">
        <h2 className="login-title">READY TO</h2>
        <h1 className="login-subtitle">LOGIN</h1>

        <form onSubmit={Login} className="login-form">
          {error && <p className="login-error">{error}</p>}
          {countdown > 0 && (
            <p className="login-info">Waiting for 2FA... {countdown}s remaining</p>
          )}

          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="login-input" disabled={isSubmitting}/>
          
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" disabled={isSubmitting}/>
          
          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? `Please wait...` : `Login`}
          </button>
          <p className="login-register">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;
