import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/api/employees?email=${email}`);
      if (response.data.length > 0) {
        alert('Login successful');
        // Redirect to dashboard or store user info in state
      } else {
        alert('Employee not found');
      }
    } catch (error) {
      console.error('Error during login', error);
    }

    navigate('/dashboard');
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <p>
          <Link to="/signup" className="link">Don't have an account ? </Link>
        </p>
        <button className="login-btn" type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;