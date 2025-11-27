// src/components/SearchBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./SearchBar.css";

export default function SearchBar({ placeholder = "Search movies..." }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // array of movie objects
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // click outside closes dropdown
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

  // debounce + search
  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // debounce 300ms
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  async function performSearch(q) {
    try {
      const res = await api.get(`/api/movies/search`, { params: { query: q } });
      // TMDb returns results array
      const results = (res.data && res.data.results) ? res.data.results : [];
      // limit to top 8 suggestions
      setSuggestions(results.slice(0, 8));
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

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" && suggestions.length) {
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? suggestions.length - 1 : next;
      });
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? 0 : next;
      });
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        openMovie(suggestions[activeIndex].id);
      } else if (query.trim()) {
        // fallback to search results page (optional)
        navigate(`/search?query=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  function openMovie(id) {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
    navigate(`/movie/${id}`);
  }

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
          className="search-btn"
          onClick={() => {
            if (query.trim()) {
              navigate(`/search?query=${encodeURIComponent(query.trim())}`);
              setOpen(false);
            } else {
              inputRef.current?.focus();
            }
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
            const year = m.release_date ? ` (${m.release_date.slice(0,4)})` : "";
            const poster = m.poster_path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${m.poster_path}` : null;
            const active = idx === activeIndex;
            return (
              <li
                id={`sugg-${idx}`}
                role="option"
                aria-selected={active}
                key={m.id}
                className={`sugg-row ${active ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onMouseDown={(e) => { // use mouseDown so navigate happens before blur
                  e.preventDefault();
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
                  <div className="sugg-sub">{year} • {m.vote_average ? m.vote_average.toFixed(1) : "—"}</div>
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
