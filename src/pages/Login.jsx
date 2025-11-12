import { useState } from 'react';
import './Login.css';

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message || data.error || 'Login failed');
        console.error('Login error:', data);
      } else {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        // Store user info
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        const user = data.user || { name: form.name, email: form.email };
        onSuccess(user);
      }
    } catch (error) {
      console.error('Login network error:', error);
      setErr('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
        {err && <div className="error">{err}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
}
