import React from "react";
import "./Skeleton.css";

export default function DetailSkeleton() {
  return (
    <div className="md-page" style={{minHeight: '100vh', background: 'var(--bg)'}}>
      {/* Mock Hero Section */}
      <header className="md-hero" style={{position: 'relative', height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="container" style={{display: 'flex', gap: 60, width: '100%', maxWidth: 1300}}>
          
          {/* Poster Skeleton */}
          <div className="skeleton" style={{
            width: 340, 
            height: 510, 
            borderRadius: 12, 
            flexShrink: 0 
          }}></div>

          {/* Info Skeleton */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center'}}>
            {/* Title */}
            <div className="skeleton" style={{height: 60, width: '70%', borderRadius: 8}}></div>
            
            {/* Meta Row */}
            <div style={{display: 'flex', gap: 15}}>
               <div className="skeleton" style={{height: 30, width: 80, borderRadius: 20}}></div>
               <div className="skeleton" style={{height: 30, width: 60, borderRadius: 8}}></div>
               <div className="skeleton" style={{height: 30, width: 100, borderRadius: 8}}></div>
            </div>

            {/* Overview */}
            <div className="skeleton" style={{height: 120, width: '90%', borderRadius: 12}}></div>

            {/* Credits */}
            <div className="skeleton" style={{height: 80, width: '60%', borderRadius: 12}}></div>

            {/* Buttons */}
            <div style={{display: 'flex', gap: 20, marginTop: 10}}>
              <div className="skeleton" style={{height: 50, width: 160, borderRadius: 50}}></div>
              <div className="skeleton" style={{height: 54, width: 54, borderRadius: '50%'}}></div>
              <div className="skeleton" style={{height: 54, width: 54, borderRadius: '50%'}}></div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
