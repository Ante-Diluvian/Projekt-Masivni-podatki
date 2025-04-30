
import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Login() {
    return(
<section className="vh-200 pt-5 mt-5">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5">
              <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="Sample"/>
            </div>
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form >
 
                <div className="form-outline mb-4">
                  <input type="email" id="email" className="form-control form-control-lg" placeholder="Enter a valid email address" required/>
                  <label className="form-label" htmlFor="email">E-mail</label>
                </div>
  
                <div className="form-outline mb-3">
                  <input type="password" id="password" className="form-control form-control-lg"placeholder="Enter password" required/>
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
