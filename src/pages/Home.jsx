import React, { useEffect, useState } from "react";
import api from "../api";             
import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";
// import RankedRow from "../components/RankedRow";
import RowSkeleton from "../components/RowSkeleton"; 
import "./Home.css";

function Row({ title, items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <section style={{ marginTop: 28 }}>
      <h3 className="section-title">{title}</h3>
      <div className="trending-row">
        {items.map((m) => (
          <MovieCard key={m.id || m.tmdb_id} movie={m} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [lists, setLists] = useState({
    trending: [],
    latest: [],
    thriller: [],
    drama: [],
    kids: [],
    action_adventure: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  
  useEffect(() => {
    setLoading(true);
    setError("");

    const calls = {
      trending: api.get("/api/movies/trending"),
      latest: api.get("/api/movies/latest?page=1"),
      thriller: api.get("/api/movies/genre/thriller?page=1"),
      drama: api.get("/api/movies/genre/drama?page=1"),
      kids: api.get("/api/movies/genre/family?page=1"),
      action_adventure: api.get("/api/movies/genre/action_adventure?page=1")
    };

    Promise.allSettled(Object.values(calls))
      .then((results) => {
        const keys = Object.keys(calls);
        const newLists = {};
        results.forEach((r, idx) => {
          const key = keys[idx];
          if (r.status === "fulfilled") {
            const data = r.value.data;
            const items = (data && data.results) ? data.results.slice(0, 18) : [];
            newLists[key] = items;
            if (key === "trending" && items.length) {
              setHeroMovie(items[0]);
            }
          } else {
            console.warn(`Failed to load ${key}`, r.reason);
            newLists[key] = [];
          }
        });
        setLists(prev => ({ ...prev, ...newLists }));
      })
      .catch((err) => {
        console.error("Error fetching lists:", err);
        setError("Failed to load some movie lists.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Hero movie={heroMovie} />

      <div className="container">
        
        {loading ? (
          <>
            <h3 className="section-title">Trending Now</h3>
            <RowSkeleton />
          </>
        ) : (
          <Row title="Trending Now" items={lists.trending} />
        )}

        {loading ? (
          <>
            <h3 className="section-title">Latest Releases</h3>
            <RowSkeleton />
          </>
        ) : (
          <Row title="Latest Releases" items={lists.latest} />
        )}

        {loading ? (
          <>
            <h3 className="section-title">Thriller Picks</h3>
            <RowSkeleton />
          </>
        ) : (
          <Row title="Thriller Picks" items={lists.thriller} />
        )}

        {loading ? (
          <>
            <h3 className="section-title">Drama</h3>
            <RowSkeleton />
          </>
        ) : (
          <Row title="Drama" items={lists.drama} />
        )}

        {loading ? (
          <>
            <h3 className="section-title">Kids' Choice</h3>
            <RowSkeleton />
          </>
        ) : (
          <Row title="Kids' Choice" items={lists.kids} />
        )}

        {loading ? (
          <>
            <h3 className="section-title">Action & Adventure</h3>
            <RowSkeleton />
          </>
        ) : (
          <Row title="Action & Adventure" items={lists.action_adventure} />
        )}

      </div>
    </div>
  );
}












