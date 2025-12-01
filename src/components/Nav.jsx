// src/components/Nav.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Nav.css";

export default function Nav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const [q, setQ] = useState("");

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Search submit
  const submitSearch = () => {
    if (!q.trim()) return;
    navigate(`/search?query=${encodeURIComponent(q.trim())}`);
    setQ("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={() => navigate("/")}>CineVerse</div>
        <div className="search" role="search">
          <input
            className="search-input"
            placeholder="Search movies..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
          />
          <button className="search-btn" onClick={submitSearch}>🔍</button>
        </div>

        <div className="right">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/watchlist" className="nav-link">Watchlist</Link>

          <div className="profile" ref={menuRef}>
            <button className="profile-btn" onClick={() => setOpen(o => !o)}>
              <span className="profile-icon">👤</span>
              <span className="profile-name">{user?.name || user?.email || "Account"}</span>
            </button>

            {open && (
              <div className="profile-menu">
                <div className="pm-item" onClick={() => { navigate("/profile"); setOpen(false); }}>Profile</div>
                <div className="pm-item" onClick={() => { navigate("/watchlist"); setOpen(false); }}>Watchlist</div>
                <div className="pm-divider" />
                <div className="pm-item danger" onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
