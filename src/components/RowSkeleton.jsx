import React from "react";
import MovieCardSkeleton from "./MovieCardSkeleton";
import "./Skeleton.css";

export default function RowSkeleton() {
  return (
    <div className="skeleton-row">
      {Array.from({ length: 8 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
