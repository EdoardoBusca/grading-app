// src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../App';

const Login = () => {
  const { state, actions } = useContext(StoreContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Find user by name (case-insensitive)
    const user = state.users.find(u => u.name.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      alert('User not found. Please check your username.');
      return;
    }

    // Validate password
    const expectedPassword = user.role === 'jury' ? 'jury123' : user.name.toLowerCase() + '123';
    
    if (password !== expectedPassword) {
      alert('Incorrect password. Please try again.');
      setPassword('');
      return;
    }

    // Set current user and navigate
    actions.setCurrentUser(user.id);
    navigate('/client/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ background: 'white', padding: '48px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', width: '400px', maxWidth: '90%' }}>
        <h1 style={{ color: '#333', fontSize: '32px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>🎓 Grading System</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>Please sign in to continue</p>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#555', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #ddd', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#555', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #ddd', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)'; }}
          >
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f5f7fa', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: '#333' }}>Password Hints:</strong>
          <div>Students: [name]123 (e.g., alice123)</div>
          <div>Juries: jury123</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
