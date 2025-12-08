import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collectionAPI } from "../api";
import MovieCard from "../components/MovieCard";
import { useToast } from "../contexts/ToastContext";
import "./CollectionDetails.css";

export default function CollectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Edit State
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(false);
  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await collectionAPI.getOne(id);
      setCollection(res.data);
      setEditTitle(res.data.title);
      setEditDesc(res.data.description || "");
      setEditPublic(res.data.isPublic);
    } catch (err) {
      console.error(err);
      addToast("Failed to load collection or access denied", "error");
      navigate("/collections");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await collectionAPI.update(id, {
        title: editTitle,
        description: editDesc,
        isPublic: editPublic
      });
      setEditing(false);
      fetchData();
      addToast("Collection updated successfully", "success");
    } catch (err) {
      addToast("Failed to update collection", "error");
    }
  };

  const handleDelete = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    try {
      await collectionAPI.delete(id);
      addToast("Collection deleted", "success");
      navigate("/collections", { replace: true });
    } catch (err) {
      console.error(err);
      addToast("Error: " + (err.response?.data?.error || err.message), "error");
      setShowDeleteConfirm(false); // Close if failed
    }
  };

  const handleRemoveItem = async (tmdbId) => {
    if(!window.confirm("Remove movie from collection?")) return;
    try {
      await collectionAPI.removeItem(id, tmdbId);
      // Optimistic update
      setCollection(prev => ({
        ...prev,
        items: prev.items.filter(item => item.tmdbId !== tmdbId && item.tmdbId !== Number(tmdbId))
      }));
      addToast("Movie removed from collection", "success");
    } catch (err) {
      addToast("Failed to remove item", "error");
    }
  };
  
  if (loading) return <div className="container" style={{paddingTop:100}}>Loading...</div>;
  if (!collection) return null;

  return (
    <div className="collections-page">
       {/* Hero Section */}
       <div className="coll-hero">
         {collection.items && collection.items.length > 0 && (
            <div 
              className="coll-hero-backdrop" 
              style={{ 
                backgroundImage: `url(https://image.tmdb.org/t/p/original${collection.items[0].posterPath})`,
                filter: 'blur(10px)',
                transform: 'scale(1.1)' 
              }} 
            />
         )}
         <div className="coll-hero-gradient" />
         
         <div className="coll-hero-content">
           {!editing ? (
             <>
               <h1>{collection.title}</h1>
               <div className="coll-meta">
                 {collection.isPublic && <span className="badge-public">Public</span>}
                 <span>{collection.items?.length || 0} movies</span>
               </div>
               {collection.description && <p className="coll-desc">{collection.description}</p>}
               
               <div className="coll-actions" style={{justifyContent: 'flex-start', alignItems:'center', gap: 12}}>
                 <button 
                    type="button"
                    onClick={handleDelete}
                    title="Delete Collection"
                    className="md-btn-icon-delete"
                    style={{
                      background: 'rgba(255, 50, 50, 0.1)', 
                      border:'1px solid rgba(255,50,50,0.3)', 
                      color:'#ff6b6b',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      padding: 0,
                      zIndex: 100,
                      position: 'relative'
                    }}
                    onMouseEnter={e => {e.currentTarget.style.background = '#ff6b6b'; e.currentTarget.style.color='#fff';}}
                    onMouseLeave={e => {e.currentTarget.style.background = 'rgba(255, 50, 50, 0.1)'; e.currentTarget.style.color='#ff6b6b';}}
                 >
                   <svg style={{pointerEvents:'none'}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                 </button>
                 <button className="md-btn md-btn-primary" onClick={() => setEditing(true)}>
                   Edit Collection
                 </button>
               </div>
             </>
           ) : (
             <div className="edit-form-inline" style={{maxWidth: 600}}>
               <input 
                 value={editTitle} 
                 onChange={e => setEditTitle(e.target.value)} 
                 className="heading-input" 
                 placeholder="Collection Title"
               />
               <textarea 
                 value={editDesc} 
                 onChange={e => setEditDesc(e.target.value)} 
                 placeholder="Description" 
               />
               <label className="checkbox-label">
                  <input type="checkbox" checked={editPublic} onChange={e => setEditPublic(e.target.checked)} />
                  Make Public
               </label>
               <div className="coll-actions">
                  <button onClick={handleUpdate} className="md-btn md-btn-primary">Save Changes</button>
                  <button onClick={() => setEditing(false)} className="btn-cancel">Cancel</button>
               </div>
             </div>
           )}
         </div>
       </div>

       <div className="movies-grid">
         {collection.items && collection.items.map(item => (
           <div key={item.id} className="coll-movie-wrapper" style={{position:'relative'}}>
              <MovieCard movie={{
                id: item.tmdbId,
                title: item.title,
                poster_path: item.posterPath,
                release_date: item.releaseDate
              }} />
              <button 
                className="remove-item-btn"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  handleRemoveItem(item.tmdbId); 
                }}
                title="Remove from collection"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
           </div>
         ))}
       </div>

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="modal-overlay">
           <div className="modal-content" style={{maxWidth: '400px', textAlign:'center'}}>
             <h2 style={{color:'#ff6b6b'}}>Delete Collection?</h2>
             <p style={{color:'#ccc', marginBottom:'24px'}}>
               Are you sure you want to delete <strong>{collection.title}</strong>? 
               <br/>This action cannot be undone.
             </p>
             <div className="modal-actions" style={{justifyContent:'center'}}>
               <button 
                 onClick={executeDelete} 
                 className="md-btn"
                 style={{background:'#ff6b6b', color:'white', border:'none'}}
               >
                 Yes, Delete It
               </button>
               <button 
                 onClick={() => setShowDeleteConfirm(false)} 
                 className="btn-cancel"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
