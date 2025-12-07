import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const auth = useAuth();
  const userFromContext = auth?.user ?? null;
  const setUser = auth?.setUser;
  const logout = auth?.logout;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serverUser, setServerUser] = useState(null); 
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [watchcount, setWatchcount] = useState(null);

  const token = localStorage.getItem("token") || localStorage.getItem("authToken") || null;
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchProfileAndCounts = async () => {
    setLoading(true);
    setErr("");
    try {
      const p = await api.get("/api/user/profile", authConfig);
      const fetchedUser = p?.data?.user ?? null;
      setServerUser(fetchedUser);

      if (fetchedUser && typeof setUser === "function") {
        setUser(fetchedUser);
      }
      const w = await api.get("/api/user/watchlist", authConfig);
      const arr = Array.isArray(w?.data) ? w.data : w?.data?.results || [];
      setWatchcount(arr.length);
    } catch (e) {
      console.error("Failed fetching profile or watchlist:", e);
      setErr("Failed to load profile (see console).");
      setServerUser(null);
      setWatchcount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndCounts();
  }, []);

  useEffect(() => {
    const source = serverUser ?? userFromContext ?? {};
    setForm({ name: source.name ?? "", email: source.email ?? "" });
  }, [serverUser, userFromContext]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const resp = await api.put("/api/user/profile", form, authConfig);

      const updatedUser = resp?.data?.user ?? null;

      if (updatedUser) {
        setServerUser(updatedUser);
        if (typeof setUser === "function") setUser(updatedUser);
      } else {
        await fetchProfileAndCounts();
      }

      setMsg("Profile updated.");
      setEditing(false);
    } catch (error) {
      console.error("profile save error:", error);
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      setErr(backendMessage || error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const source = serverUser ?? userFromContext ?? {};
    setForm({ name: source.name ?? "", email: source.email ?? "" });
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

  const displayUser = serverUser ?? userFromContext ?? {};

  return (
    <div className="profile-page container">
      <div className="profile-back">
        <button onClick={() => navigate(-1)} className="back-link">← Back</button>
      </div>

      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar">
            { (displayUser?.name || "U").charAt(0).toUpperCase() }
          </div>
          <div className="name">{displayUser?.name || "Unnamed User"}</div>
          <div className="email">{displayUser?.email || "No email provided"}</div>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">{watchcount === null ? "…" : watchcount}</div>
              <div className="stat-label">Watchlist</div>
            </div>
            <div className="stat">
              <div className="stat-num">{displayUser?.createdAt ? new Date(displayUser.createdAt).getFullYear() : "—"}</div>
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

          {loading ? (
            <div className="details-read">
               <div className="skeleton" style={{height: 24, width: '40%', marginBottom: 12, borderRadius: 4}}></div>
               <div className="skeleton" style={{height: 24, width: '60%', marginBottom: 12, borderRadius: 4}}></div>
               <div className="skeleton" style={{height: 24, width: '20%', borderRadius: 4}}></div>
            </div>
          ) : (
            <>
              {!editing && (
                <div className="details-read">
                  <div className="row"><strong>Name</strong><span>{displayUser?.name || "-"}</span></div>
                  <div className="row"><strong>Email</strong><span>{displayUser?.email || "-"}</span></div>
                  <div className="row"><strong>ID</strong><span>{displayUser?.id || displayUser?.userId || "—"}</span></div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
