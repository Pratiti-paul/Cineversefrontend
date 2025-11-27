import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import React from "react";



export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    const result = await login(form);

    if (result.success) {
      navigate('/welcome');
    } else {
      setErr(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        {err && <div className="error">{err}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-switch">
        <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up here</Link></p>
      </div>
    </div>
  );
}
