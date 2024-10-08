import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Analytics.css';

function Analytics() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employee analytics', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSignOut = () => {
    navigate('/login');
  };

  return (
    <div className="analytics">
      <h2 className="analytics-title">Analytics Dashboard</h2>
      {employees.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Goals</th>
              <th>Progress</th>
              <th>Evaluation Score</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.goals}</td>
                <td>{employee.progress}</td>
                <td>{employee.evaluationScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No employee data found</p>
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

export default Analytics;