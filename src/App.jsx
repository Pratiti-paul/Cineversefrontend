import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import WelcomePage from './pages/WelcomePage';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/welcome' : '/signup'} />} />
      <Route path="/signup" element={user ? <Navigate to="/welcome" /> : <Signup />} />
      <Route path="/login" element={user ? <Navigate to="/welcome" /> : <Login />} />
      <Route path="/welcome" element={user ? <WelcomePage /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
