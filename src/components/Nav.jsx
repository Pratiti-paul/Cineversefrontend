// src/components/Nav.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoHome } from "react-icons/go";
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
          {/* <Link to="/" className="nav-link">Home</Link> */}
          {/* <Link to="/watchlist" className="nav-link">Watchlist</Link> */}
          <Link to="/" className="nav-icon-link">
            <GoHome size={22} />
          </Link>

     

        <div className="profile" ref={menuRef}>
          <button
            className="profile-btn"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-haspopup="true"
            title={user?.name || "Account"}
          >
            <div className="avatar-sm">
              {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <span className="profile-name-short">
              {(user?.name && user.name.split(" ")[0])}
            </span>
            <span className="caret" aria-hidden>{open ? "▴" : "▾"}</span>
          </button>

          {open && (
            <div className="profile-menu" role="menu" aria-label="Account menu">
              <div className="pm-header">
                <div className="pm-avatar">{(user?.name || user?.email || "A").charAt(0).toUpperCase()}</div>
                <div className="pm-user">
                  <div className="pm-name">{user?.name || "Unnamed"}</div>
                  <div className="pm-email">{user?.email || ""}</div>
                </div>
              </div>

              <div className="pm-list">
                <button className="pm-item" onClick={() => { navigate("/profile"); setOpen(false); }}>
                  Profile
                </button>

                <button className="pm-item" onClick={() => { navigate("/recommendations"); setOpen(false); }}>
                  Recommendations
                </button>

                <button className="pm-item" onClick={() => { navigate("/watchlist"); setOpen(false); }}>
                  Watchlist
                </button>
              </div>

              <div className="pm-divider" />

              <button className="pm-item pm-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>

          </div>
        </div>
    
    </header>
  );
}
