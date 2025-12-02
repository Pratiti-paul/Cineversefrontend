// src/pages/Recommendations.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import MovieCard from "../components/MovieCard";
import "./Recommendations.css";

const GENRES = [
  { key: "all", label: "All" },
  { key: "thriller", label: "Thriller" },
  { key: "drama", label: "Drama" },
  { key: "family", label: "Family" },
  { key: "action_adventure", label: "Action / Adventure" },
  { key: "comedy", label: "Comedy" },
  { key: "horror", label: "Horror" },
  { key: "animation", label: "Animation" }
];

export default function Recommendations() {
  const [lists, setLists] = useState({
    trending: [],
    latest: [],
    thriller: [],
    drama: [],
    family: [],
    action_adventure: [],
    comedy: [],
    horror: [],
    animation: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("popularity"); // popularity / rating / year

  useEffect(() => {
    setLoading(true);
    setError("");

    const calls = {
      trending: api.get("/api/movies/trending"),
      latest: api.get("/api/movies/latest?page=1"),
      thriller: api.get("/api/movies/genre/thriller?page=1"),
      drama: api.get("/api/movies/genre/drama?page=1"),
      family: api.get("/api/movies/genre/family?page=1"),
      action_adventure: api.get("/api/movies/genre/action_adventure?page=1"),
      comedy: api.get("/api/movies/genre/comedy?page=1"),
      horror: api.get("/api/movies/genre/horror?page=1"),
      animation: api.get("/api/movies/genre/animation?page=1")
    };

    Promise.allSettled(Object.values(calls))
      .then((results) => {
        const keys = Object.keys(calls);
        const newLists = {};
        results.forEach((r, idx) => {
          const key = keys[idx];
          if (r.status === "fulfilled") {
            const data = r.value.data;
            const items = data && data.results ? data.results.slice(0, 24) : [];
            newLists[key] = items;
          } else {
            console.warn(`Failed to load ${key}`, r.reason);
            newLists[key] = [];
          }
        });
        setLists((prev) => ({ ...prev, ...newLists }));
      })
      .catch((err) => {
        console.error("Error fetching recommendation lists:", err);
        setError("Failed to load recommendations.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge unique movies across lists into a single array
  const mergedMovies = useMemo(() => {
    const map = new Map();
    Object.values(lists).forEach((arr) => {
      arr.forEach((m) => {
        const id = m.id || m.tmdbId || m.tmdb_id;
        if (!id) return;
        if (!map.has(id)) map.set(id, m);
      });
    });
    return Array.from(map.values());
  }, [lists]);

  // filter by selectedGenre
  const filtered = useMemo(() => {
    if (selectedGenre === "all") return mergedMovies;
    // Some TMDb items have genre_ids array. We rely on list grouping, but also attempt to match genre_names if present.
    return mergedMovies.filter((m) => {
      // if item has genre_ids and we know the genre id mapping in the backend we used,
      // fallback: check strings in m.genre_ids or m.genres
      if (Array.isArray(m.genre_ids)) {
        // simple mapping of genre key -> ids (matches your backend GENRE_MAP)
        const GENRE_IDS = {
          thriller: [53],
          drama: [18],
          family: [10751],
          action_adventure: [28, 12],
          comedy: [35],
          horror: [27],
          animation: [16]
        };
        const ids = GENRE_IDS[selectedGenre] || [];
        return m.genre_ids.some((gid) => ids.includes(gid));
      }
      if (Array.isArray(m.genres)) {
        // genres might be [{id,name}, ...]
        return m.genres.some((g) => (g.name || "").toLowerCase().includes(selectedGenre.replace("_", " ")));
      }
      // fallback: try genre_names property or first genre string
      if (m.genre_names && Array.isArray(m.genre_names)) {
        return m.genre_names.some((g) => g.toLowerCase().includes(selectedGenre.replace("_", " ")));
      }
      // otherwise allow
      return true;
    });
  }, [mergedMovies, selectedGenre]);

  // sort
  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => {
      if (sortBy === "popularity") {
        return (b.popularity || 0) - (a.popularity || 0);
      } else if (sortBy === "rating") {
        return (b.vote_average || 0) - (a.vote_average || 0);
      } else if (sortBy === "year") {
        const ya = a.release_date ? Number(a.release_date.slice(0, 4)) : 0;
        const yb = b.release_date ? Number(b.release_date.slice(0, 4)) : 0;
        return yb - ya;
      }
      return 0;
    });
    return arr;
  }, [filtered, sortBy]);

  return (
    <div className="rec-page container">
      <div className="rec-hero">
        <h1>Recommended for you</h1>
        <p className="muted">Fresh picks tailored from trending, latest and genre highlights.</p>
      </div>

      <div className="rec-body">
        <aside className="rec-sidebar">
          <div className="panel">
            <h3>Filter</h3>
            <div className="genres">
              {GENRES.map((g) => (
                <button
                  key={g.key}
                  className={`genre-btn ${selectedGenre === g.key ? "active" : ""}`}
                  onClick={() => setSelectedGenre(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <h3 style={{ marginTop: 18 }}>Sort by</h3>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="year">Year</option>
            </select>

            <div className="small-muted">Results: {sorted.length}</div>
          </div>
        </aside>

        <main className="rec-main">
          {loading && <div className="status">Loading recommendations…</div>}
          {error && <div className="status error">{error}</div>}

          {!loading && !error && sorted.length === 0 && (
            <div className="status">No recommendations available.</div>
          )}

          <div className="rec-grid">
            {sorted.map((m) => (
              <MovieCard key={m.id || m.tmdbId || m.tmdb_id} movie={m} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
