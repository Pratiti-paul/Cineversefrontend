import React from "react";
import "./Skeleton.css";

export default function MovieCardSkeleton() {
  return (
    <div>
      <div className="movie-skeleton skeleton"></div>
      <div className="text-skeleton skeleton"></div>
      <div className="text-skeleton short skeleton"></div>
    </div>
  );
}
