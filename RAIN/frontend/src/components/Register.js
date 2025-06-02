import { useState } from 'react';

function Register() {
  const [username, setUsername] = useState([]);
  const [password, setPassword] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState([]);
  const [email, setEmail] = useState([]);
  const [age, setAge] = useState([]);
  const [weight, setWeight] = useState([]);
  const [height, setHeight] = useState([]);
  const [gender, setGender] = useState([]);
  const [error, setError] = useState("");



  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/users", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          username: username,
          password: password,
          age: age,
          weight: weight,
          height: height,
          gender: gender,
        })
      });

      const data = await res.json();
       if(data._id !== undefined){
          window.location.href="/";
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error(err);
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: '800px', borderRadius: '25px' ,width: '100%', backgroundColor: '#2C2C2E', color: 'white' }}>
        <h2 className="text-center mb-4" style={{ color: '#FF3B3F' }}>Register</h2>

        <form onSubmit={handleRegister}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <input type="text" name="username" style={{borderRadius: '15px'}} className="form-control bg-dark text-white border-0" placeholder="Username" value={username} onChange={(e)=>(setUsername(e.target.value))} required />
          </div>

          <div className="mb-3">
            <input type="email" name="email" style={{borderRadius: '15px'}} className="form-control bg-dark text-white border-0" placeholder="Email" value={email} onChange={(e)=>(setEmail(e.target.value))} required />
          </div>

          <div className="mb-3">
            <input type="password" name="password" style={{borderRadius: '15px'}} className="form-control bg-dark text-white border-0" placeholder="Password" value={password} onChange={(e)=>(setPassword(e.target.value))} required />
          </div>

          <div className="mb-3">
            <input type="password" name="confirmPassword" style={{borderRadius: '15px'}} className="form-control bg-dark text-white border-0" placeholder="Confirm Password" value={confirmPassword} onChange={(e)=>(setConfirmPassword(e.target.value))} required />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <input type="number" name="age" min="1" max="120" style={{borderRadius: '15px'}} className="form-control bg-dark text-white border-0" placeholder="Age" value={age} onChange={(e)=>(setAge(e.target.value))}/>
            </div>

            <div className="col-md-4 mb-3">
              <input type="number" name="weight" min="1" max="500" style={{borderRadius: '15px'}} step="0.1" className="form-control bg-dark text-white border-0" placeholder="Weight (kg)" value={weight} onChange={(e)=>(setWeight(e.target.value))}/>
            </div>
            <div className="col-md-4 mb-3">
              <input type="number" name="height" min="1" max="300" style={{borderRadius: '15px'}} step="0.1" className="form-control bg-dark text-white border-0" placeholder="Height (cm)" value={height} onChange={(e)=>(setHeight(e.target.value))}/>
            </div>
          </div>


          <div className="mb-3">
            <select name="gender" style={{borderRadius: '15px'}} className="form-select bg-dark text-white border-0" value={gender} onChange={(e)=>(setGender(e.target.value))}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" style={{borderRadius: '10px'}} className="btn btn-danger w-100">Register</button>
          <p className="mt-3 text-center">
            Already have an account? <a href="/login" style={{ color: '#FF3B3F' }}>Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
