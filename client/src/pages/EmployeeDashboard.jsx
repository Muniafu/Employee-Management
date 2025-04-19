import { useEffect, useState } from 'react';
import axios from '../services/api';
import { Auth as useAuth } from '../contexts/AuthContext';

const EmployeeDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axios.get(`/performance/${user.id}`);
        setPerformance(response.data);
      } catch (err) {
        console.error('Failed to fetch performance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [user.id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Performance</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {performance ? (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Overall Score</h2>
              <div className="text-3xl font-bold text-blue-500">{performance.score}/5</div>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Feedback</h2>
              <p className="text-gray-700">{performance.feedback}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Goals</h2>
              <ul className="list-disc pl-5">
                {performance.goals.map((goal, index) => (
                  <li key={index} className="text-gray-700">{goal}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>No performance review available yet.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;