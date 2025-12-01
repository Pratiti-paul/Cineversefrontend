
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MovieCard.css";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><rect width='100%' height='100%' fill='#0b1a19'/><text x='50%' y='50%' fill='#2fe6c7' font-size='20' font-family='Arial' text-anchor='middle' dy='.3em'>No Image</text></svg>`
  );

export default function MovieCard({
  movie = {},
  onAdd = null,
  addEndpoint = "http://localhost:3000/api/user/watchlist",
  tokenKey = null,
}) {
  const posterPath = movie.poster_path || movie.poster || movie.backdrop_path || "";
  const base = import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w780";
  const img = posterPath ? `${base}${posterPath}` : PLACEHOLDER;

  const movieId = movie.id || movie.tmdbId || movie.tmdb_id || null;
  const title = movie.title || movie.name || "Untitled";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

  const [added, setAdded] = useState(Boolean(movie.inWatchlist || movie.isInWatchlist));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const buildPayload = () => {
    return {
      tmdbId: movieId,
      title,
      poster: posterPath ? posterPath : null,
      release_date: movie.release_date || null,
    };
  };

  const defaultAdd = async () => {
    setErr(null);
    setLoading(true);
    try {
      let token = null;
      if (tokenKey) {
        token = localStorage.getItem(tokenKey);
      } else {
        token = localStorage.getItem("token") || localStorage.getItem("authToken");
      }

      const res = await fetch(addEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        let message = `Server responded ${res.status}`;
        try {
          const json = await res.json();
          if (json?.message) message = json.message;
        } catch (err) {
          console.error("Failed to parse error response:", err);
        }
        throw new Error(message);
      }

      setAdded(true);
      setLoading(false);
      return true;
    } catch (error) {
      setErr(error.message || "Failed to add");
      setLoading(false);
      return false;
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

      if (ok) {
        setAdded(true);
      } else {
        if (!err) setErr("Could not add to watchlist");
      }
    } catch (error) {
      setErr(error?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="movie-card"
      role="article"
      aria-label={title}
      data-added={added ? "true" : "false"}
    >
      <div className="card-media">
        <Link to={movieId ? `/movie/${movieId}` : "#"} className="card-link" aria-label={`Open ${title}`}>
          <img
            src={img}
            alt={title + " poster"}
            className="movie-img"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
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
            // check icon (simple)
            <svg viewBox="0 0 24 24" className="wl-icon" aria-hidden="true">
              <path d="M9 16.2l-3.5-3.5L4 14.2 9 19 20 8 18.6 6.6z" />
            </svg>
          ) : (
            // plus icon
            <svg viewBox="0 0 24 24" className="wl-icon" aria-hidden="true">
              <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
          )}
        </button>
      </div>

      {/* inline small error message (optional) */}
      {err && <div className="wl-error" role="alert">Failed: {err}</div>}
    </div>
  );
}


