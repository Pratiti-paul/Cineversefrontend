import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./RankedRow.css";

export default function RankedRow({ title, items = [], limit = 10, showBadge = true }) {
  const slice = (items || []).slice(0, limit);

  return (
    <section className="ranked-row-wrap">
      <div className="ranked-title">{title}</div>

      <div className="ranked-list">
        {slice.map((m, i) => {
          const poster = m.poster_path || m.poster || m.backdrop_path || m.image || "";
          const base = import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w342";
          const imgSrc = poster ? `${base}${poster}` : "";

          return (
            <div key={m.id || m.tmdb_id || i} className="ranked-item">
              <div className="ranked-number" aria-hidden>
                {i + 1}
              </div>

              <Link to={m.id ? `/movie/${m.id}` : "#"} className="ranked-poster-link" aria-label={m.title || m.name || `Movie ${i+1}`}>
                <div className="ranked-poster" style={{ backgroundImage: imgSrc ? `url(${imgSrc})` : undefined }}>
                  {showBadge && <span className="ranked-badge">Recently added</span>}
                </div>
              </Link>

              <div className="ranked-caption">
                <div className="rk-title" title={m.title || m.name || ""}>
                  {m.title || m.name || "Untitled"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

RankedRow.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
  limit: PropTypes.number,
  showBadge: PropTypes.bool,
};
