import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails"; 
import Nav from "./components/Nav";
import LoadingSpinner from "./components/LoadingSpinner";
import Detailspage from "./pages/Detailspage";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";

// Protect routes that NEED auth
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

// Protect login/signup from logged users
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
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <AppRoutes />
    </AuthProvider>
  );
}
