import React from "react";
import "./Pagination.css";

export default function Pagination({ page, totalPages, onChange }) {
  // Show nothing when single page
  if (!totalPages || totalPages <= 1) return null;

  const pageNum = Number(page) || 1;
  const firstVisible = Math.max(1, pageNum - 2);
  const lastVisible = Math.min(totalPages, pageNum + 2);

  const pages = [];
  for (let i = firstVisible; i <= lastVisible; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pg-btn"
        disabled={pageNum <= 1}
        onClick={() => onChange(pageNum - 1)}
      >
        ← Prev
      </button>

      {firstVisible > 1 && (
        <>
          <button className="pg-btn" onClick={() => onChange(1)}>1</button>
          {firstVisible > 2 && <span className="pg-ellips">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pg-btn ${p === pageNum ? "active" : ""}`}
          onClick={() => onChange(p)}
          aria-current={p === pageNum ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      {lastVisible < totalPages && (
        <>
          {lastVisible < totalPages - 1 && <span className="pg-ellips">…</span>}
          <button className="pg-btn" onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pg-btn"
        disabled={pageNum >= totalPages}
        onClick={() => onChange(pageNum + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
