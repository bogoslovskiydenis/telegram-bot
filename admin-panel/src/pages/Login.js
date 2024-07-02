import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5003/api/auth/login', {
                username,
                password,
            });
            localStorage.setItem('token', response.data.token);
            setMessage('Login successful');
            // Use Navigate to redirect to '/dashboard'
            return <Navigate to="/dashboard" />;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage('Invalid credentials');
            } else {
                setMessage('Something went wrong. Please try again later.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto' }}>
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
            {/* Register button can still use history.push */}
            <button onClick={() => <Navigate to="/register" />} style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>Register</button>
        </div>
    );
};

export default Login;
