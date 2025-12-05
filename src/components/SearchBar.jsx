import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./SearchBar.css";

export default function SearchBar({ placeholder = "Search movies..." }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!q || q.trim().length < 1) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchSuggestions(q.trim());
    }, 260);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q]);

  async function fetchSuggestions(query) {
    try {
      const res = await api.get("/api/movies/search", { params: { query } });
      const items = res?.data?.results || [];
      setSuggestions(items.slice(0, 8));
      setOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function openMovie(id) {
    setOpen(false);
    setQ("");
    setActiveIndex(-1);
    navigate(`/movie/${id}`);
  }

  function handleKeyDown(e) {
    if (!open && e.key === "ArrowDown" && suggestions.length) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (e.key === "ArrowDown") {
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActiveIndex((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        openMovie(suggestions[activeIndex].id);
      } else if (q.trim()) {
        navigate(`/search?query=${encodeURIComponent(q.trim())}`);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="search-root" ref={rootRef}>
      <div className="search-input-wrap">
        <input
          ref={inputRef}
          className="search-input"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
        />
        <button
          type="button"
          className="search-btn"
          onClick={() => {
            if (!q.trim()) {
              inputRef.current?.focus();
              return;
            }
            navigate(`/search?query=${encodeURIComponent(q.trim())}`);
            setOpen(false);
          }}
          aria-label="Search"
        >
          🔍
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="search-suggestions" id="search-suggestions" role="listbox">
          {suggestions.map((m, idx) => {
            const title = m.title || m.name || "Untitled";
            const year = m.release_date ? ` (${m.release_date.slice(0, 4)})` : "";
            const poster = m.poster_path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${m.poster_path}` : null;
            const isActive = idx === activeIndex;
            return (
              <li
                id={`sugg-${idx}`}
                role="option"
                key={m.id}
                aria-selected={isActive}
                className={`sugg-row ${isActive ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onMouseDown={(e) => { e.preventDefault(); openMovie(m.id); }}
              >
                {poster ? (
                  <img src={poster} alt={title} className="sugg-thumb" />
                ) : (
                  <div className="sugg-thumb placeholder" />
                )}
                <div className="sugg-meta">
                  <div className="sugg-title">{title}</div>
                  <div className="sugg-sub">{year} • {m.vote_average ? m.vote_average.toFixed(1) : "—"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {loading && <div className="search-loading">Searching…</div>}
      {open && !loading && suggestions.length === 0 && <div className="search-empty">No results</div>}
    </div>
  );
}
