import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Activity size={28} />
          SevaScope AI
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'NGO' && (
                <>
                  <Link to="/" className={`nav-link ${isActive('/')}`}>Dashboard</Link>
                  <Link to="/needmap" className={`nav-link ${isActive('/needmap')}`}>NeedMap</Link>
                  <Link to="/submit" className={`nav-link ${isActive('/submit')}`}>Submit Data</Link>
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{user.name} ({user.role})</span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
              <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
