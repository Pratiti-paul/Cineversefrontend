import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails"; 
import Nav from "./components/Nav";
import LoadingSpinner from "./components/LoadingSpinner";
import Detailspage from "./pages/Detailspage";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import Recommendations from "./pages/Recommendations";
import Collections from "./pages/Collections";
import CollectionDetails from "./pages/CollectionDetails";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/movie/:id" element={<Detailspage />} />

      <Route path="/search" element={<SearchResults />} />


      
      <Route
        path="/login"
        element={
          <RequireGuest>
            <Login />
          </RequireGuest>
        }
      />

      <Route
        path="/signup"
        element={
          <RequireGuest>
            <Signup />
          </RequireGuest>
        }
      />


      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/recommendations" element={<Recommendations />} />
      
      <Route
        path="/collections"
        element={
          <RequireAuth>
            <Collections />
          </RequireAuth>
        }
      />
      <Route path="/collections/:id" element={<CollectionDetails />} />
      <Route
        path="/watchlist"
        element={<Watchlist />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Nav />
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
