import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../components/Header';
import './Dashboard.css';

function Dashboard() {
  const [employee, setEmployee] = useState(null);
  const email = "employee@example.com";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employees?email=${email}`);
        if (response.data.length > 0) {
          setEmployee(response.data[0]);
        } else {
          alert('Employee data not found');
        }
      } catch (error) {
        console.error('Error fetching employee data', error);
      }
    };

    fetchEmployee();
  }, []);

  const handleSignOut = () => {
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Employee Dashboard</h2>
      {employee ? (
        <div className="employee-info">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Goals:</strong> {employee.goals}</p>
          <p><strong>Progress:</strong> {employee.progress}</p>
          <p><strong>Evaluation Score:</strong> {employee.evaluationScore}</p>
        </div>
      ) : (
        <p>Loading employee data...</p>
      )}

<div className="button">
        <button onClick={handleSignOut} className="btn btn-outline-danger signOut">
          Sign Out
        </button>
      </div>

      <footer className="footer">
        <p>
          ©{new Date().getFullYear()} <a href="https://yourcompany.com" target="_blank" rel="noopener noreferrer">Employee Performance</a>. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default Dashboard;