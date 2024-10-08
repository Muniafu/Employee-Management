import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login'); // Redirect to login page
  };

  const handleSignup = () => {
    navigate('/signup'); // Redirect to signup page
  };
  return (
    <div className="home-container">
      <h1>Welcome to the Employee Performance Platform</h1>
      <p>
        This platform allows you to track and manage your performance goals, progress, and evaluations.<br/><br/>
        Join us today to take your career to the next level!
      </p>
      <div className="btn-container">
        <button onClick={handleLogin} className="btn btn-primary">Login</button>
        <button onClick={handleSignup} className="btn btn-secondary">Signup</button>
      </div>

      <footer className="footer">
        <p>
          ©{new Date().getFullYear()} <a href="https://yourcompany.com" target="_blank" rel="noopener noreferrer">Employee Performance</a>. All rights reserved.
        </p>
      </footer>
    </div>    
  );
}

export default Home;