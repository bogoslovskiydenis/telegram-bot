import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5003/api/auth/register', {
                username,
                password,
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error registering user');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
            <h2>Register</h2>
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
                <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Register</button>
            </form>
            {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
};

export default Register;
