import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [redirectToDashboard, setRedirectToDashboard] = useState(false);
    const [redirectToRegister, setRedirectToRegister] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5004/login', {
                email: username,
                password,
            });

            // Save authToken to localStorage
            localStorage.setItem('authToken', response.data.authToken);
            setMessage('Login successful');
            setRedirectToDashboard(true);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage('Invalid credentials');
            } else {
                setMessage('Something went wrong. Please try again later.');
                console.error('Login error:', error);
            }
        }
    };

    if (redirectToDashboard) {
        return <Navigate to="/dashboard" />;
    }

    if (redirectToRegister) {
        return <Navigate to="/login" />;
    }

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '0.5rem', width: '100%', fontSize: '1rem' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '0.5rem', width: '100%', fontSize: '1rem' }}
                        required
                    />
                </div>
                <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Login</button>
            </form>
            {message && <p style={{ marginTop: '1rem', color: message.startsWith('Invalid') ? 'red' : 'green' }}>{message}</p>}
            <button
                onClick={() => setRedirectToRegister(true)}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    fontSize: '1rem',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Register
            </button>
        </div>
    );
};

export default Login;
