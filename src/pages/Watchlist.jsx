import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
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

      {loading && (
        <div className="wl-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      )}
      {err && <div className="wl-error">{err}</div>}

      {!loading && !err && items.length === 0 && (
        <div className="wl-empty">
          <p>Your watchlist is empty.</p>
          <p>Browse movies and click the heart to save them here.</p>
        </div>
      )}

      {!loading && (
        <div className="wl-grid">
          {items.map((movie) => (
            <MovieCard
              key={movie.tmdbId || movie.id || movie.tmdb_id}
              movie={movie}
              onRemove={async (m) => {
                try {
                  // Remove from backend
                  const idToRemove = m.id; // Watchlist ID
                  await api.delete(`/api/user/watchlist/${idToRemove}`);
                  
                  // Update local state
                  setItems((prev) => prev.filter((item) => item.id !== idToRemove));
                } catch (err) {
                  console.error("remove failed", err);
                  const msg = err?.response?.data?.message || "Failed to remove";
                  setErr(msg);
                  // Clear error after 3 seconds
                  setTimeout(() => setErr(""), 3000);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
