import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');

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
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;