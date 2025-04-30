import { useState } from 'react';

function Register() {
 
    return(
        <section className="vh-100">
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-12 col-xl-11">
              <div className="card text-black">
                <div className="card-body p-md-5">
                  <div className="row justify-content-center align-items-center">
                    <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                      <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp" className="img-fluid" alt="Sample"/>
                    </div>
      
                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                      <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
                      <form className="mx-1 mx-md-4">
                        
                      <div className="input-group mb-4">
                        <span className="input-group-text">
                            <i className="fas fa-user"></i>
                        </span>
                        <input type="text" className="form-control" placeholder="username" />
                        </div>

      

                        <div className="input-group mb-4">
                        <span className="input-group-text">
                        <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                        </span>
                        <input type="email" className="form-control" placeholder="E-mail" />
                        </div>
                    

                        <div className="input-group mb-4">
                        <span className="input-group-text">
                        <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                        </span>
                        <input type="password" className="form-control" placeholder="Password" />
                        </div>
                
                        <div className="input-group mb-4">
                        <span className="input-group-text">
                        <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                        </span>
                        <input type="password" className="form-control" placeholder="Repeat your password" />
                        </div>
      
                        <div className="form-check mb-5">
                        <input className="form-check-input me-2" type="checkbox" id="termsCheckbox" />
                        <label className="form-check-label" htmlFor="termsCheckbox">
                            I agree to all statements in <a href="">Terms of service</a>
                        </label>
                        </div>

                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                          <button type="button" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg" >Register</button>
                        </div>
                      </form>
                    </div>
      
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
         
    );
}
export default Register;