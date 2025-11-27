
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; 
import MovieCard from "../components/MovieCard";
import "./Detailspage.css";

export default function Detailspage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const p1 = api.get(`/api/movies/${id}`);
    const p2 = api.get(`/api/movies/${id}/reviews`);
    const p3 = api.get(`/api/movies/${id}`);

    Promise.allSettled([p1, p2, p3]).then((results) => {
      if (!mounted) return;
      const [resDetails, resReviews, resSimilar] = results;

      if (resDetails.status === "fulfilled") {
        setMovie(resDetails.value.data);
      } else {
        console.error("Details failed:", resDetails.reason);
        setErr("Failed to load movie details.");
      }

      if (resReviews.status === "fulfilled") {
        setReviews(resReviews.value.data.results?.slice(0, 4) || []);
      } else {
        console.warn("Reviews fetch failed: ", resReviews.reason);
        setReviews([]);
      }

      if (resDetails.status === "fulfilled" && resDetails.value.data.similar?.results) {
        setSimilar(resDetails.value.data.similar.results.slice(0, 12));
      } else if (resSimilar.status === "fulfilled" && resSimilar.value.data.similar?.results) {
        setSimilar(resSimilar.value.data.similar.results.slice(0, 12));
      } else {
        setSimilar([]);
      }

      setLoading(false);
    });

    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="md-loading">Loading...</div>;
  if (err || !movie) return <div className="md-error">{err || "Movie not found."}</div>;

  const genres = movie.genres?.map(g => g.name).join(", ");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const runtime = movie.runtime ? `${movie.runtime} min` : "";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

  const poster = movie.backdrop_path || movie.poster_path
    ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.backdrop_path || movie.poster_path}`
    : "/placeholder-portrait.png";

  return (
    <div className="md-page">
      <header className="md-hero" style={{ backgroundImage: `url(${poster})` }}>
        <div className="md-hero-overlay">
          <h1 className="md-title">{movie.title || movie.name} <span className="md-year"> {year}</span></h1>
          <div className="md-meta">
            <span className="md-rating">★ {rating}</span>
            {genres && <span className="md-genres">{genres}</span>}
            {runtime && <span className="md-runtime">{runtime}</span>}
          </div>

          <div className="md-ctas">
            <button className="md-btn md-watch">Watch Now</button>
            <button className="md-btn md-more" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>More Info</button>
          </div>
        </div>
      </header>

      <main className="md-content container">
        <section className="md-overview">
          <h2>About</h2>
          <p>{movie.overview}</p>
        </section>

        <section className="md-reviews">
          <h2>Reviews & Ratings</h2>
          <div className="md-reviews-list">
            {reviews.length ? (
              reviews.map(r => (
                <div key={r.id} className="md-review">
                  <div className="md-review-head">
                    <div className="md-avatar">{(r.author && r.author[0]) || "U"}</div>
                    <div>
                      <div className="md-review-author">{r.author}</div>
                      <div className="md-review-date">{(r.created_at || "").slice(0,10)}</div>
                    </div>
                    <div className="md-review-rating">{ r.author_details?.rating ? `${r.author_details.rating}/10` : "" }</div>
                  </div>
                  <div className="md-review-body">{r.content.slice(0, 400)}{r.content.length > 400 ? "..." : ""}</div>
                </div>
              ))
            ) : (
              <div className="md-no-reviews">No reviews available.</div>
            )}
          </div>
        </section>

        <section className="md-similar">
          <h2>You May Also Like</h2>
          <div className="md-similar-row">
            {similar.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
