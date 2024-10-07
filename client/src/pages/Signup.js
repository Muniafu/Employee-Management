import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goals, setGoals] = useState('');
  const [progress, setProgress] = useState('');
  const [evaluationScore, setEvaluationScore] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/employees/add', {
        name, email, goals, progress, evaluationScore
      });
      alert('Employee added successfully');
    } catch (error) {
      console.error('Error adding employee', error);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Goals" value={goals} onChange={(e) => setGoals(e.target.value)} required />
        <input type="text" placeholder="Progress" value={progress} onChange={(e) => setProgress(e.target.value)} required />
        <input type="number" placeholder="Evaluation Score" value={evaluationScore} onChange={(e) => setEvaluationScore(e.target.value)} required />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;