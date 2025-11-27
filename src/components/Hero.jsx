import React from "react";
import "./Hero.css";

export default function Hero({ movie }) {
  const bg = movie?.backdrop_path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.backdrop_path}` : "";

  return (
    <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
      <div className="hero-overlay">
        <h1>{movie?.title || "Welcome to CineVerse"}</h1>
        <p className="tagline">{movie?.overview?.slice(0, 220) || "Discover and save your favourite movies."}</p>
        <div className="hero-ctas">
          <button className="cta primary">Watch Now</button>
          <button className="cta secondary">More Info</button>
        </div>
      </div>
    </section>
  );
}
