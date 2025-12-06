import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import "./Watchlist.css";

export default function Watchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    const token =
      (user && user.token) ||
      localStorage.getItem("cine_token") ||
      localStorage.getItem("auth_token") || 
      null;

    if (!token) {
      setErr("Please log in to view your watchlist.");
      setLoading(false);
      return;
    }

    api.get("/api/user/watchlist")
      .then((res) => {
        if (!mounted) return;
        const data = res?.data;
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.watchlist)
          ? data.watchlist
          : [];
        setItems(arr);
        console.log("Fetched watchlist:", arr);
      })
      .catch((err) => {
        console.error("Failed to load watchlist:", err);
        // surface backend message if present
        const message = err?.response?.data?.message || err?.message || "Unable to load watchlist.";
        setErr(message);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [user]);
  console.log("Watchlist items:", items);

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
            onAdd={async (m) => {
              // If the card calls onAdd, we'll use the same api instance.
              try {
                const payload = {
                  tmdbId: m.id || m.tmdbId || m.tmdb_id,
                  title: m.title || m.name,
                  poster: m.poster_path || m.poster,
                  release_date: m.release_date || null,
                };

                const resp = await api.post("/api/user/watchlist", payload);

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
