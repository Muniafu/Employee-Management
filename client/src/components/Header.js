import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Logic to handle sign out (if needed, e.g., clearing local storage)
    navigate('/login');  // Redirect to login page
  };
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Employee Performance</Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">Signup</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/analytics">Analytics</Link>
            </li>
          </ul>
        </div>
        <button onClick={handleSignOut} className="btn btn-outline-danger">
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default Header;