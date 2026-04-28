import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Login</h1>
      <div className="card">
        {error && <div style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</div>}
        <div style={{ 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid #3B82F6', 
          borderRadius: '8px', 
          padding: '0.75rem', 
          marginBottom: '1.5rem', 
          fontSize: '0.85rem', 
          color: '#3B82F6',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          <strong>Note:</strong> Please wait couple of seconds for the backend <b>render</b> server to wake up if it's currently inactive.
        </div>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            className="input-field" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
