import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Auth as useAuth } from '../contexts/AuthContext';
import employeeService from '../services/employeeService';

const PerformanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
    const { user } = useAuth();
    const pdfRef = useRef(null);

  const [formData, setFormData] = useState({
    score: '',
    feedback: '',
    goals: ['', '', ''],
    status: 'pending',
  });
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editable, setEditable] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchData = async () => {
        try {
            setLoading(true);
          const [employeeRes, performanceRes] = await Promise.all([
            employeeService.getEmployee(id),
            employeeService.getPerformanceReviewById(id),
          ]);
          setEmployee(employeeRes.data);
          if (performanceRes.data) {
            setFormData({
              score: performanceRes.data.score,
              feedback: performanceRes.data.feedback,
              goals: performanceRes.data.goals,
              status: performanceRes.data.status,
            });
            setEditable(user.role === 'admin' && performanceRes.data.status === 'pending');
          }
        } catch (err) {
          setError(err.message?.data?.message || 'Failed to fetch data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, user]);

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id === 'new') {
        await employeeService.createPerformanceReview({
          ...formData,
          employeeId: employee.id,
        });
        toast.success('Performance review created successfully!');
      }
      navigate(user.role === 'admin' ? 'admin' : '/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (pdfRef.current) {
        pdfRef.current.save('performance_review.pdf');
    }
};


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id === 'new' ? 'Add Performance Review' : 'Edit Performance Review'}
      </h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {employee && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Employee: {employee.name}</h2>
          <p className="text-gray-600">{employee.department}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="score">Score (1-5)</label>
          <input
            id="score"
            type="number"
            min="1"
            max="5"
            disabled={!editable}
            className="w-full px-3 py-2 border rounded-lg"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="feedback">Feedback</label>
          <textarea
            id="feedback"
            className="w-full px-3 py-2 border rounded-lg"
            rows="4"
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Goals</label>
          {formData.goals.map((goal, index) => (
            <input
              key={index}
              type="text"
              className="w-full px-3 py-2 border rounded-lg mb-2"
              value={goal}
              onChange={(e) => handleGoalChange(index, e.target.value)}
              required
            />
          ))}
        </div>

        <div className="mb-4">
              <label className="block text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={user.role !== 'admin'}
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
              </select>
        </div>

        {id !== 'new' && (
            <button
            onClick={exportPDF}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          )}        
      </form>
    </div>
  );
};

export default PerformanceForm;