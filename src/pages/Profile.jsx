import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser, logout } = useAuth ? useAuth() : { user: null };
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [watchcount, setWatchcount] = useState(null);

  useEffect(() => {
    // fetch watchlist count
    let mounted = true;
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      setWatchcount(0);
      return;
    }

    api
      .get("/api/user/watchlist", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!mounted) return;
        const arr = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setWatchcount(arr.length);
      })
      .catch(() => {
        if (!mounted) return;
        setWatchcount(0);
      });

    return () => (mounted = false);
  }, []);

  // keep local form in sync if user changes externally
  useEffect(() => {
    setForm({ name: user?.name || "", email: user?.email || "" });
  }, [user?.name, user?.email]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      // call backend to update profile - change endpoint if your API is different
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await api.put("/api/user/profile", form, { headers });

      // if backend returns updated user object, update context (if setUser available)
      if (resp?.data?.user && typeof setUser === "function") {
        setUser(resp.data.user);
      }

      setMsg("Profile updated.");
      setEditing(false);
    } catch (error) {
      console.error("profile save error:", error);
      setErr(error?.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || "", email: user?.email || "" });
    setErr("");
    setMsg("");
    setEditing(false);
  };

  const handleLogout = async () => {
    if (typeof logout === "function") {
      await logout();
      navigate("/login");
    } else {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-back">
        <button onClick={() => navigate(-1)} className="back-link">← Back to Home</button>
      </div>

      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar">{(user?.name || "U").charAt(0).toUpperCase()}</div>
          <div className="name">{user?.name || "Unnamed User"}</div>
          <div className="email">{user?.email || "No email provided"}</div>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">{watchcount === null ? "…" : watchcount}</div>
              <div className="stat-label">Watchlist</div>
            </div>
            <div className="stat">
              <div className="stat-num">{user?.createdAt ? new Date(user.createdAt).getFullYear() : "—"}</div>
              <div className="stat-label">Member since</div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
            <button className="btn btn-ghost" onClick={() => navigate("/watchlist")}>View Watchlist</button>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="profile-right">
          <h3>Account Details</h3>

          {!editing && (
            <div className="details-read">
              <div className="row"><strong>Name</strong><span>{user?.name || "-"}</span></div>
              <div className="row"><strong>Email</strong><span>{user?.email || "-"}</span></div>
              <div className="row"><strong>ID</strong><span>{user?.id || user?.userId || "—"}</span></div>
            </div>
          )}

          {editing && (
            <form className="profile-form" onSubmit={handleSave}>
              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>

              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}

          {msg && <div className="form-msg success">{msg}</div>}
          {err && <div className="form-msg error">{err}</div>}
        </div>
      </div>
    </div>
  );
}
