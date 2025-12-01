import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import api from "../api";           // your axios instance
import { useAuth } from "../contexts/AuthContext";
import "./Watchlist.css";

export default function Watchlist() {
  const { user } = useAuth ? useAuth() : { user: null };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    // Prefer token from context if you have auth; otherwise fallback to localStorage keys
    const token =
      (user && user.token) ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null;

    if (!token) {
      setErr("Please log in to view your watchlist.");
      setLoading(false);
      return;
    }

    // Use your axios api wrapper if it already includes baseURL
    api.get("/api/user/watchlist", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!mounted) return;
        // Accept either array directly or { results: [...] }
        const data = res?.data;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : data?.watchlist || [];
        setItems(arr);
      })
      .catch((err) => {
        console.error("Failed to load watchlist:", err);
        setErr("Unable to load watchlist.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="watchlist-page container">
      <h1 className="wl-title">My Watchlist</h1>

      {loading && <div className="wl-info">Loading your watchlist…</div>}
      {err && <div className="wl-error">{err}</div>}

      {!loading && !err && items.length === 0 && (
        <div className="wl-empty">
          <p>Your watchlist is empty.</p>
          <p>Browse movies and click the heart to save them here.</p>
        </div>
      )}

      <div className="wl-grid">
        {items.map((movie) => (
          <MovieCard
            key={movie.tmdbId || movie.id || movie.tmdb_id}
            movie={movie}
            // optional: pass onAdd so the card can call back and update UI without refetch
            onAdd={async (m) => {
              // optimistic UI: return true only if server call succeeded
              try {
                const payload = {
                  tmdbId: m.id || m.tmdbId || m.tmdb_id,
                  title: m.title || m.name,
                  poster: m.poster_path || m.poster,
                  release_date: m.release_date || m.first_air_date || null,
                };
                const t =
                  (user && user.token) ||
                  localStorage.getItem("token") ||
                  localStorage.getItem("authToken");
                const resp = await api.post(
                  "/api/user/watchlist",
                  payload,
                  { headers: t ? { Authorization: `Bearer ${t}` } : {} }
                );
                // Optionally append to items state if adding from Watchlist page
                return resp.status >= 200 && resp.status < 300;
              } catch (err) {
                console.error("add to watchlist failed:", err);
                return false;
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
