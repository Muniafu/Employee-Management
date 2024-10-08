import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [employee, setEmployee] = useState(null);
  const email = "employee@example.com"; // Simulate logged-in employee's email

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
    </div>
  );
}

export default Dashboard;