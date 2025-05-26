
import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Login() {

  const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext); 

    async function Login(e){
      e.preventDefault();
      const res = await fetch("http://localhost:3001/users/login2fa", {
          method: "POST",
          credentials: "include",
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
              username: username,
              password: password
          })
      });
      const data = await res.json();
      console.log("JA");
      if (!data || !data._id) {
          console.log("Invalid login attempt");
          setUsername("");
          setPassword("");
          setError("Invalid username or password");
      } else {
          console.log("Login successful", data);
          userContext.setUserContext(data);
          window.location.href = "/";
      }

  }

    return(
<section className="vh-200 pt-5 mt-5">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5">
              <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="Sample"/>
            </div>
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={Login}>
 
                <div className="form-outline mb-4">
                  <input type="username" className="form-control form-control-lg" placeholder="Enter a valid username"  value={username} onChange={(e)=>(setUsername(e.target.value))} required/>
                  <label className="form-label" htmlFor="username">username</label>
                </div>
  
                <div className="form-outline mb-3">
                <input 
  type="password" 
  id="password" 
  className="form-control form-control-lg"
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)} 
  required 
/>
                  <label className="form-label" htmlFor="password">Password</label>
                </div>
  
                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check mb-0">
                    <input className="form-check-input me-2" type="checkbox" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                </div>
  
                <div className="text-center text-lg-start mt-4 pt-2">
                  <button type="submit" className="btn btn-primary btn-lg">Login</button>
                  <p className="small fw-bold mt-2 pt-1 mb-0">Don't have an account? <a href="/register" className="link-danger">Register</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
}
export default Login;
