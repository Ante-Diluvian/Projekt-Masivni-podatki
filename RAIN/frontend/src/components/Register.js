import { useState } from 'react';

function Register() {
 
    return(
        <div className="register-container">
            <h2>Register</h2>
            <form action="/api/register" method="POST">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>

    );
}
export default Register;