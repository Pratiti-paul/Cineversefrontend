import './WelcomePage.css';

const WelcomePage = ({ username, onLogout }) => {
  return (
    <div className="welcome-container">
      <h1>Welcome, {username}!</h1>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default WelcomePage;
