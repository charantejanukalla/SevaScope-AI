import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('NGO');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Register</h1>
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
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Full Name" 
            className="input-field" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
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
          <select 
            className="input-field" 
            value={role} 
            onChange={e => setRole(e.target.value)}
          >
            <option value="NGO">NGO (Coordinator)</option>
            <option value="VOLUNTEER">Volunteer (Responder)</option>
          </select>
          <button type="submit" className="btn" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
