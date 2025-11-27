import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./MovieDetails.css";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/api/movies/${id}`)
      .then(r => { if (mounted) setMovie(r.data); })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false); });
    return () => mounted = false;
  }, [id]);

  const addToWatchlist = async () => {
    setAdding(true);
    try {
      await api.post("/api/user/watchlist", { tmdbId: Number(id), title: movie.title, poster: movie.poster_path || movie.backdrop_path });
      alert("Added to watchlist");
    } catch (err) {
      alert(err?.response?.data?.error || "Add failed. Login required.");
    } finally { setAdding(false); }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!movie) return <div className="container">Movie not found</div>;

  const videos = movie.videos?.results || [];
  const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos[0];
  const youtubeKey = trailer ? trailer.key : null;

  return (
    <div>
      <div className="container details">
        <div className="left-col">
          <img className="poster-large" src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.poster_path || movie.backdrop_path}`} alt={movie.title} />
          <button className="btn primary" onClick={addToWatchlist} disabled={adding}>{adding ? "Adding..." : "Add to Watchlist"}</button>
        </div>

        <div className="right-col">
          <h1>{movie.title}</h1>
          <p className="meta">{movie.release_date} • {movie.runtime} min</p>
          <p className="overview">{movie.overview}</p>

          <h4>Cast</h4>
          <div className="cast-row">
            {movie.credits?.cast?.slice(0,8).map(c => (
              <div key={c.cast_id || c.id} className="cast-item">
                <img src={c.profile_path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${c.profile_path}` : "/"} alt={c.name} />
                <div className="cast-name">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {youtubeKey && (
        <div className="container">
          <h3>Trailer</h3>
          <div className="video-wrap">
            <iframe width="100%" height="480" src={`https://www.youtube.com/embed/${youtubeKey}`} title="Trailer" frameBorder="0" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
