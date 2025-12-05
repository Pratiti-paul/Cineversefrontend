import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

export default function Hero({ movie }) {
  const navigate = useNavigate();

  const bg = movie?.backdrop_path
    ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.backdrop_path}`
    : "";

  const handleMoreInfo = (e) => {
    e.preventDefault();
    if (movie?.id) navigate(`/movie/${movie.id}`);
  };

  const handleWatchNow = (e) => {
    e.preventDefault();
    console.log("Watch Now clicked — currently no action.");
  };

  return (
    <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
      <div className="hero-overlay">
        <h1>{movie?.title || "Welcome to CineVerse"}</h1>
        <p className="tagline">
          {movie?.overview?.slice(0, 220) || "Discover and save your favourite movies."}
        </p>

        <div className="hero-ctas">
          <button className="cta primary" onClick={handleWatchNow}>
            ▶ Watch Now
          </button>

          <button className="cta secondary" onClick={handleMoreInfo}>
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}
