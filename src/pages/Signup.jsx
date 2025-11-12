import { useState } from 'react';
import './Signup.css';

export default function Signup({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message || data.error || 'Signup failed');
        console.error('Signup error:', data);
      } else {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        // Store user info
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        onSuccess();
      }
    } catch (error) {
      console.error('Signup network error:', error);
      setErr('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
        {err && <div className="error">{err}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
      </form>
    </div>
  );
}
