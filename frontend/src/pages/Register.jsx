import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role_name: 'customer', // default role
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      // After register, redirect to login
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{
        textAlign: 'center',
        marginTop: '50px'
      }}>
      <h2>Register</h2>
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
          }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
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
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            marginBottom: '5px',
            display: 'block'
          }}>Role:</label>
          <select
            name="role_name"
            value={formData.role_name}
            onChange={handleChange}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
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
          Register
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login" style={{
          color: '#007bff',
          textDecoration: 'none'
        }}>Login</Link>
      </p>
    </div>
  </div>
  );
};

export default Register;