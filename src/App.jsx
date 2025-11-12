import { useState } from 'react';
import './App.css';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import WelcomePage from './pages/WelcomePage.jsx';

function App() {
  const [view, setView] = useState('signup');
  const [user, setUser] = useState(null);

  const handleSignupSuccess = () => setView('login');
  const handleLoginSuccess = (u) => {
    setUser(u);
    setView('welcome');
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('login');
  };

  return (
    <>
      {view === 'signup' && <Signup onSuccess={handleSignupSuccess} />}
      {view === 'login' && <Login onSuccess={handleLoginSuccess} />}
      {view === 'welcome' && <WelcomePage username={user?.username || user?.email || 'User'} onLogout={handleLogout} />}
    </>
  );
}

export default App;
