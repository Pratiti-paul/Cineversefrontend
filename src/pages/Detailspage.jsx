
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; 
import MovieCard from "../components/MovieCard";
import DetailSkeleton from "../components/DetailSkeleton";
import { useAuth } from "../contexts/AuthContext";
import "./Detailspage.css";

export default function Detailspage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [localReviews, setLocalReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Review Form
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");

  const handlePostReview = async () => {
    if (!userReview.trim()) return;
    try {
      const res = await api.post("/api/reviews", {
        tmdbId: id,
        content: userReview,
        rating: userRating
      });
      setLocalReviews([res.data, ...localReviews]);
      setUserReview("");
    } catch (error) {
      console.error("Post review failed", error);
      alert("Failed to post review");
    }
  };

  const addToWatchlist = async () => {
    if (!movie) return;
    if (inWatchlist) return; 

    try {
      const payload = {
        tmdbId: movie.id,
        title: movie.title || movie.name,
        posterPath: movie.poster_path || movie.backdrop_path,
        release_date: movie.release_date || null
      };
      await api.post("/api/user/watchlist", payload);
      setInWatchlist(true);
    } catch (error) {
       console.error("Watchlist add failed", error);
    }
  };

  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const p1 = api.get(`/api/movies/${id}`);
    const p2 = api.get(`/api/movies/${id}/reviews`);
    const p3 = api.get(`/api/movies/${id}`);
    const p4 = api.get(`/api/reviews/${id}`);
    const p5 = user ? api.get("/api/user/watchlist") : Promise.resolve({ data: [] });

    Promise.allSettled([p1, p2, p3, p4, p5]).then((results) => {
      if (!mounted) return;
      const [resDetails, resReviews, resSimilar, resLocal, resWatchlist] = results;

      if (resDetails.status === "fulfilled") {
        setMovie(resDetails.value.data);
      } else {
        console.error("Details failed:", resDetails.reason);
        setErr("Failed to load movie details.");
      }

      if (resReviews.status === "fulfilled") {
        setReviews(resReviews.value.data.results?.slice(0, 4) || []);
      } else {
        setReviews([]);
      }

      if (resLocal.status === "fulfilled") {
        setLocalReviews(resLocal.value.data || []);
      }

      if (resDetails.status === "fulfilled" && resDetails.value.data.similar?.results) {
        setSimilar(resDetails.value.data.similar.results.slice(0, 12));
      } else if (resSimilar.status === "fulfilled" && resSimilar.value.data.similar?.results) {
        setSimilar(resSimilar.value.data.similar.results.slice(0, 12));
      } else {
        setSimilar([]);
      }

      if (resWatchlist.status === "fulfilled" && resDetails.status === "fulfilled") {
        const wl = resWatchlist.value.data;
        const list = Array.isArray(wl) ? wl : (wl.watchlist || wl.results || []);
        const currentId = resDetails.value.data.id;
        const exists = list.some(item => (item.tmdbId === currentId || item.tmdbId === Number(currentId)));
        setInWatchlist(exists);
      }

      setLoading(false);
    });

    return () => { mounted = false; };
  }, [id, user]);

  if (loading) return <DetailSkeleton />;
  if (err || !movie) return <div className="md-error">{err || "Movie not found."}</div>;

  const crew = movie.credits?.crew || [];
  const castList = movie.credits?.cast || [];
  const director = crew.find((m) => m.job === "Director");
  const topCast = castList.slice(0, 3).map((c) => c.name).join(", ");

  const genres = movie.genres?.slice(0, 3).map((g) => g.name).join(", ");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

  const base = import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/original";
  const backdropUrl = movie.backdrop_path 
    ? `${base}${movie.backdrop_path}` 
    : movie.poster_path 
    ? `${base}${movie.poster_path}`
    : "/placeholder-landscape.png";

  const posterUrl = movie.poster_path 
    ? `${base}${movie.poster_path}` 
    : movie.backdrop_path
    ? `${base}${movie.backdrop_path}`
    : "/placeholder-portrait.png";

  return (
    <div className="md-page">
      <header className="md-hero">
        <div className="md-hero-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="md-hero-gradient" />
        </div>
        
        <div className="md-hero-content container">
          <div className="md-poster-wrapper">
            <img src={posterUrl} alt={movie.title || movie.name} className="md-poster-img" />
          </div>

          <div className="md-hero-info">
            <h1 className="md-title">{movie.title || movie.name}</h1>
            
            <div className="md-meta-row">
              {rating !== "N/A" && (
                <div className="md-badge-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:4}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> 
                  {rating}
                </div>
              )}
              
              {year && (
                <div className="md-meta-item">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{marginRight:6}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {year}
                </div>
              )}

              {runtime && (
                <div className="md-meta-item">
                   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{marginRight:6}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   {runtime}
                </div>
              )}

              {movie.genres && movie.genres.length > 0 && (
                 <div className="md-genre-pill">{movie.genres[0].name}</div>
              )}
            </div>

            <p className="md-overview-text">{movie.overview}</p>

            <div className="md-credits-box">
              {director && (
                <div className="md-credit-row">
                  <span className="md-credit-label">Director:</span>
                  <span className="md-credit-val">{director.name}</span>
                </div>
              )}
              {topCast && (
                <div className="md-credit-row">
                  <span className="md-credit-label">Cast:</span>
                  <span className="md-credit-val">{topCast}</span>
                </div>
              )}
            </div>

            <div className="md-ctas">
              <button className="md-btn md-btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:8}}><path d="M8 5v14l11-7z"/></svg>
                Watch Trailer
              </button>
              
              <button 
                className={`md-btn-circle ${inWatchlist ? "md-added" : ""}`} 
                title={inWatchlist ? "In Watchlist" : "Add to Watchlist"} 
                onClick={addToWatchlist}
                style={inWatchlist ? { borderColor: '#0fb59a', color: '#0fb59a' } : {}}
              >
                 {inWatchlist ? (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19 20 8 18.6 6.6z" /></svg>
                 ) : (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                 )}
              </button>

              <button className="md-btn-circle" title="Share">
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4-4v13"/></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="md-content container">
        {/* <section className="md-overview">
          <h2>About</h2>
          <p>{movie.overview}</p>
        </section> */}

        <section className="md-reviews">
          <h2>Reviews & Ratings</h2>
          
          <div className="md-user-reviews">
             {/* <h3>Community Reviews</h3> */}
             
             {user ? (
               <div className="md-write-review">
                 <h4>Write a Review</h4>
                 <div className="md-star-input">
                   {[1,2,3,4,5,6,7,8,9,10].map(star => (
                     <span 
                       key={star} 
                       className={`star-pick ${star <= userRating ? 'active' : ''}`}
                       onClick={() => setUserRating(star)}
                     >★</span>
                   ))}
                   <span className="md-rating-val">{userRating}/10</span>
                 </div>
                 <textarea 
                   className="md-review-input" 
                   placeholder="Share your thoughts..."
                   value={userReview}
                   onChange={(e) => setUserReview(e.target.value)}
                 />
                 <button className="md-btn md-btn-primary md-submit-btn" onClick={handlePostReview}>Post Review</button>
               </div>
             ) : (
               <div className="md-login-prompt">
                 <a href="/login" style={{color: 'var(--accent)', textDecoration:'underline'}}>Log in</a> to write a review.
               </div>
             )}

             <div className="md-local-auth-reviews">
               {localReviews.length > 0 ? (
                 localReviews.map(r => (
                   <div key={r.id} className="md-review">
                     <div className="md-review-head">
                       <div className="md-avatar user-avatar">{(r.user?.name || "U")[0]}</div>
                       <div>
                         <div className="md-review-author">{r.user?.name || "User"}</div>
                         <div className="md-review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                       </div>
                       {r.rating && <div className="md-review-rating">{r.rating}/10</div>}
                     </div>
                     <div className="md-review-body">{r.content}</div>
                   </div>
                 ))
               ) : null}
             </div>
          </div>

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
              <div className="md-no-reviews">No TMDB reviews available.</div>
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
