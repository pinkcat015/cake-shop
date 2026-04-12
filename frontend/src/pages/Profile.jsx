import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch profile');
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  if (!profile) {
    return (
      <div>
        <Navbar />
        <div style={{
          textAlign: 'center',
          marginTop: '50px'
        }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{
        textAlign: 'center',
        marginTop: '50px'
      }}>
        <h2>Profile</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role_name}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;