import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import "./Nav.css";

export default function Nav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const [q, setQ] = useState("");

  useEffect(() => {
    const onDoc = (e) => {
      // Close profile menu if clicked outside
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Close mobile menu on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const submitSearch = () => {
    if (!q.trim()) return;
    navigate(`/search?query=${encodeURIComponent(q.trim())}`);
    setQ("");
    setMobileMenuOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMobileNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={() => navigate("/")}>CineVerse</div>
        
        {/* Desktop Search */}
        <div className="search" role="search">
          <SearchBar placeholder="Search movies..." />
        </div>

        {/* Hamburger Icon */}
        <button 
          className="hamburger-btn" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

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

                <button className="pm-item" onClick={() => { navigate("/collections"); setOpen(false); }}>
                  My Collections
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
    
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-search">
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKey}
              />
              <button onClick={submitSearch}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>

            <div className="mobile-nav-links">
              <button onClick={() => handleMobileNav("/")}>Home</button>
              <button onClick={() => handleMobileNav("/watchlist")}>Watchlist</button>
              <button onClick={() => handleMobileNav("/collections")}>Collections</button>
              <button onClick={() => handleMobileNav("/recommendations")}>Recommendations</button>
              <button onClick={() => handleMobileNav("/profile")}>Profile</button>
              {user ? (
                <button onClick={handleLogout} className="mobile-logout">Logout</button>
              ) : (
                <button onClick={() => handleMobileNav("/login")} className="mobile-login">Login</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
