import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Analytics.css';

function Analytics() {
  const [employees, setEmployees] = useState([]);

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
    </div>
  );
}

export default Analytics;