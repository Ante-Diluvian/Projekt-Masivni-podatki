import React, { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

    //TODO: Logiko za prijavo uporabnika

    return (
    <div>
        <h2>Prijava</h2>
        <form onSubmit={handleSubmit}>
            <div>
            <label>Email:</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>

            <div>
            <label>Geslo:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <button type="submit">Prijavi se</button>
        </form>

        <p>
            Nimate računa?{' '}
            <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => navigate('/register')}
            >
            Registrirajte se
            </span>
        </p>
    </div>
    );
};

export default LoginScreen;