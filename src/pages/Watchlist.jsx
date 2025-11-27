import React, { useEffect, useState } from "react";
import api from "../api";
import "./Watchlist.css";

export default function Watchlist() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/user/watchlist").then(r => setList(r.data)).catch(err => console.error(err));
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/api/user/watchlist/${id}`);
      setList(s => s.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="container">
      <h2>Your Watchlist</h2>
      <div className="watchlist-grid">
        {list.map(item => (
          <div key={item.id} className="watch-card">
            <img src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}${item.poster}`} alt={item.title} />
            <div className="watch-meta">
              <div className="title">{item.title}</div>
              <button className="btn" onClick={() => remove(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
