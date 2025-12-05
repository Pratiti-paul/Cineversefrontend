import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import MovieCard from "../components/MovieCard";
import RowSkeleton from "../components/RowSkeleton";
import Pagination from "../components/Pagination";
import "./SearchResults.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const navigate = useNavigate();

  const q = query.get("query") || "";
  const pageParam = Number(query.get("page") || 1);

  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    api
      .get("/api/movies/search", { params: { query: q, page } })
      .then((res) => {
        const data = res.data || {};
        setResults(data.results || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch((err) => {
        console.error("SearchResults fetch error:", err);
        setError("Failed to load search results.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [q, page]);

  // When user clicks pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate(`/search?query=${encodeURIComponent(q)}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sr-page">
      <div className="sr-container">
        <div className="sr-header">
          <button className="sr-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2>
            Search results for <span className="sr-query">“{q}”</span>
          </h2>
        </div>

        {loading && <RowSkeleton />}
        {error && <div className="sr-error">{error}</div>}

        {!loading && !error && results.length === 0 && (
          <div className="sr-empty">No results for “{q}”. Try another search.</div>
        )}

        {!loading && results.length > 0 && (
          <div className="sr-grid">
            {results.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}

        {/* P A G I N A T I O N */}
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>
    </div>
  );
}
