import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminReports = () => {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.get('/performance/admin/overview', token);
      setOverview(data);
    };
    fetchData();
  }, []);

  if (!overview) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin Performance Overview</h2>
      <p>Total Users: {overview.totalUsers}</p>
      <p>Approved Users: {overview.approvedUsers}</p>
      <h3>Average Metric Values</h3>
      <ul>
        {overview.metrics.map((m) => (
          <li key={m._id}>{m._id}: {m.avgValue.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminReports;