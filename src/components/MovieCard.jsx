// import React from "react";
// import { Link } from "react-router-dom";
// import "./MovieCard.css";

// export default function MovieCard({ movie }) {
//   const img = movie.poster_path
//     ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.poster_path}`
//     : "";

//   return (
//     <div className="movie-card">
//       <Link to={`/movie/${movie.id}`}>
//         <img src={img} alt={movie.title} className="movie-img" />

//         <div className="meta">
//           <div className="title">{movie.title}</div>
//           <div className="sub">
//             {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
//           </div>
//         </div>
//       </Link>
//     </div>
//   );
// }



import React from "react";
import { Link } from "react-router-dom";
import "./MovieCard.css";

// use a small inline placeholder (or save one to /public and reference "/placeholder.png")
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><rect width='100%' height='100%' fill='#0b1a19'/><text x='50%' y='50%' fill='#2fe6c7' font-size='20' font-family='Arial' text-anchor='middle' dy='.3em'>No Image</text></svg>`
);

export default function MovieCard({ movie = {} }) {
  // support either poster_path or poster (saved watchlist)
  const posterPath = movie.poster_path || movie.poster || movie.backdrop_path || "";
  const img = posterPath
    ? `${import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w780"}${posterPath}`
    : PLACEHOLDER;

  // defensive movie id
  const movieId = movie.id || movie.tmdbId || movie.tmdb_id;

  return (
    <div className="movie-card" role="article" aria-label={movie.title || movie.name || "movie"}>
      <Link to={movieId ? `/movie/${movieId}` : "#"}>
        <img
          src={img}
          alt={movie.title || movie.name || "Movie poster"}
          className="movie-img"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        <div className="meta">
          <div className="title">{movie.title || movie.name || "Untitled"}</div>
          <div className="sub">{movie.release_date ? movie.release_date.slice(0, 4) : ""}</div>
        </div>
      </Link>
    </div>
  );
}

