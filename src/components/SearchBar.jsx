import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./SearchBar.css";

export default function SearchBar({ placeholder = "Search movies..." }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // movie objects
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // close on outside click
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

  // debounce search
  useEffect(() => {
    const q = query?.trim();
    if (!q || q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSearch(q);
    }, 250);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  async function performSearch(q) {
    try {
      const res = await api.get("/api/movies/search", { params: { query: q } });

      // Normalize shapes: supports TMDB { results: [...] } or direct array [...]
      let results = [];
      if (!res || !res.data) results = [];
      else if (Array.isArray(res.data)) results = res.data;
      else if (Array.isArray(res.data.results)) results = res.data.results;
      else if (Array.isArray(res.data.data)) results = res.data.data;
      else results = [];

      setSuggestions(results.slice(0, 8));
      setOpen(results.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Search error:", err.response?.data || err.message);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" && suggestions.length) {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        openMovie(suggestions[activeIndex].id);
      } else if (query.trim()) {
        navigateToSearch(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  function openMovie(id) {
    if (!id) return;
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
    navigate(`/movie/${id}`);
  }

  function navigateToSearch(q) {
    setOpen(false);
    setActiveIndex(-1);
    navigate(`/search?query=${encodeURIComponent(q)}`);
  }

  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w92";

  return (
    <div className="search-root" ref={rootRef}>
      <div className="search-input-wrap">
        <input
          ref={inputRef}
          className="search-input"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `sugg-${activeIndex}` : undefined}
        />

        <button
          type="button"
          className="search-btn"
          onClick={() => {
            if (query.trim()) navigateToSearch(query.trim());
            else inputRef.current?.focus();
          }}
          aria-label="Search"
        >
          Search
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="search-suggestions" id="search-suggestions" role="listbox">
          {suggestions.map((m, idx) => {
            const title = m.title || m.name || "Untitled";
            const year = m.release_date ? ` (${m.release_date.slice(0, 4)})` : "";
            const poster = m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null;
            const active = idx === activeIndex;
            return (
              <li
                id={`sugg-${idx}`}
                role="option"
                aria-selected={active}
                key={m.id ?? idx}
                className={`sugg-row ${active ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onMouseDown={(e) => {
                  e.preventDefault(); // navigate before blur
                  openMovie(m.id);
                }}
              >
                {poster ? (
                  <img src={poster} alt={title} className="sugg-thumb" />
                ) : (
                  <div className="sugg-thumb placeholder" />
                )}

                <div className="sugg-meta">
                  <div className="sugg-title">{title}</div>
                  <div className="sugg-sub">
                    {year} • {m.vote_average ? Number(m.vote_average).toFixed(1) : "—"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && !loading && suggestions.length === 0 && (
        <div className="search-empty">No results</div>
      )}

      {loading && <div className="search-loading">Searching…</div>}
    </div>
  );
}
