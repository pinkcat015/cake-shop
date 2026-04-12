import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Navbar from '../components/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token);
      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{
        textAlign: 'center',
        marginTop: '50px',
        backgroundImage: 'url(/path/to/your/image.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        width: '100%',
        minHeight: '100vh'
      }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            marginBottom: '5px',
            display: 'block'
          }}>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            marginBottom: '5px',
            display: 'block'
          }}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/register" style={{
          color: '#007bff',
          textDecoration: 'none'
        }}>Register</Link>
      </p>
    </div>
  </div>
  );
};

export default Login;