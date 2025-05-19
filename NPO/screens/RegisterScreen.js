// src/pages/RegisterScreen.js
import React, { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

    //TODO: Logiko za registracijo uporabnika

    return (
    <div>
        <h2>Registracija</h2>
        <form>
            <div>
            <label>Uporabniško ime:</label>
            <input
                type="text"
                value={username}
                //onChange={(e) => setUsername(e.target.value)}
                required
            />
            </div>

            <div>
            <label>Email:</label>
            <input
                type="email"
                value={email}
                //onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>

            <div>
            <label>Geslo:</label>
            <input
                type="password"
                value={password}
                //onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <button type="submit">Registriraj se</button>
        </form>

        <p>
            Že imate račun?{' '}
            <span
            style={{ color: 'blue', cursor: 'pointer' }}
            //onClick={() => navigate('/login')}
            >
            Prijavite se
            </span>
        </p>
    </div>
    );
};

export default RegisterScreen;