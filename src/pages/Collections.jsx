import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collectionAPI } from "../api";
import "./Collections.css";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await collectionAPI.getAll();
      setCollections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await collectionAPI.create({ title: newTitle, description: newDesc, isPublic });
      setShowModal(false);
      setNewTitle("");
      setNewDesc("");
      setIsPublic(false);
      fetchCollections();
    } catch (err) {
      alert("Failed to create collection");
    }
  };

  if (loading) return <div className="container" style={{paddingTop: 100}}>Loading...</div>;

  return (
    <div className="container collections-page">
      <div className="collections-header">
        <h1>My Collections</h1>
        <button className="md-btn md-btn-primary" onClick={() => setShowModal(true)}>
          + New Collection
        </button>
      </div>

      <div className="collections-grid">
        {collections.length === 0 ? (
          <p>No collections yet. Create one to start organizing movies!</p>
        ) : (
          collections.map(c => (
            <Link to={`/collections/${c.id}`} key={c.id} className="collection-card">
              <div className="collection-preview">
                {c.items && c.items.length > 0 ? (
                  <div className="cp-grid">
                     {c.items.slice(0, 4).map((item, i) => (
                       <img key={i} src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} alt="" />
                     ))}
                  </div>
                ) : (
                  <div className="cp-empty">Empty</div>
                )}
              </div>
              <div className="collection-info">
                <h3>{c.title}</h3>
                <p>{c.items?.length || 0} items</p>
                {c.isPublic && <span className="badge-public">Public</span>}
              </div>
            </Link>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Collection</h2>
            <form onSubmit={handleCreate}>
              <input 
                type="text" 
                placeholder="Collection Title" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                required 
              />
              <textarea 
                placeholder="Description (optional)" 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
              />
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isPublic} 
                  onChange={e => setIsPublic(e.target.checked)} 
                />
                Make Public
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="md-btn md-btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
