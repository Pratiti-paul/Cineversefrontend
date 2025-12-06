// src/components/MovieCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./MovieCard.css";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><rect width='100%' height='100%' fill='#0b1a19'/><text x='50%' y='50%' fill='#2fe6c7' font-size='20' font-family='Arial' text-anchor='middle' dy='.3em'>No Image</text></svg>`
  );

export default function MovieCard({
  movie = {},
  onAdd = null, 
  tokenKey = null,
}) {
  const posterPath = movie.posterPath || movie.poster || movie.backdrop_path || "";
  const base = import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w780";
  const img = posterPath ? `${base}${posterPath}` : PLACEHOLDER;
  console.log("movie card image path:", posterPath);

  const movieId = movie.id || movie.tmdbId || movie.tmdb_id || null;
  const title = movie.title || movie.name || "Untitled";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

  const [added, setAdded] = useState(Boolean(movie.inWatchlist || movie.isInWatchlist));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const buildPayload = () => ({
    tmdbId: movieId,
    title,
    posterPath: posterPath || null,
    release_date: movie.release_date || null,
  });

  const defaultAdd = async () => {
    setErr(null);
    setLoading(true);
    try {
      // call your axios instance which should have Authorization header set
      const res = await api.post("/api/user/watchlist", buildPayload());
      if (res.status >= 200 && res.status < 300) {
        setAdded(true);
        return true;
      } else {
        throw new Error(res?.data?.message || `Server ${res.status}`);
      }
    } catch (error) {
      console.error("defaultAdd error:", error);
      setErr(error?.response?.data?.message || error.message || "Failed to add");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (added || loading) return;

    setErr(null);
    setLoading(true);

    try {
      let ok = false;
      if (typeof onAdd === "function") {
        const result = await onAdd(movie);
        ok = result === undefined ? true : Boolean(result);
      } else {
        ok = await defaultAdd();
      }

      if (ok) setAdded(true);
      else if (!err) setErr("Could not add to watchlist");
    } catch (error) {
      setErr(error?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-card" role="article" aria-label={title} data-added={added ? "true" : "false"}>
      <div className="card-media">
        <Link to={movieId ? `/movie/${movieId}` : "#"} className="card-link" aria-label={`Open ${title}`}>
          <img src={img} alt={title + " poster"} className="movie-img" onError={(e) => (e.currentTarget.src = PLACEHOLDER)} />
          <div className="meta">
            <div className="title">{title}</div>
            <div className="sub">{year}</div>
          </div>
        </Link>

        <button
          type="button"
          className={`watchlist-btn ${added ? "added" : ""}`}
          onClick={handleAddClick}
          aria-pressed={added}
          aria-label={added ? "Added to watchlist" : "Add to watchlist"}
          title={added ? "In watchlist" : "Add to watchlist"}
        >
          {loading ? (
            <span className="wl-spinner" aria-hidden="true" />
          ) : added ? (
            <svg viewBox="0 0 24 24" className="wl-icon" aria-hidden="true">
              <path d="M9 16.2l-3.5-3.5L4 14.2 9 19 20 8 18.6 6.6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="wl-icon" aria-hidden="true">
              <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
          )}
        </button>
      </div>

      {err && <div className="wl-error" role="alert">Failed: {err}</div>}
    </div>
  );
}
