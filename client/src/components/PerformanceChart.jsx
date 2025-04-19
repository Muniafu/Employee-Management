import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import employeeService from '../services/employeeService';

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceChart = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await employeeService.getPerformanceReviews();
        setReviews(response.data);
      } catch (error) {
        console.error('Failed to load performance reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  const chartData = {
    labels: ['Poor (1-2)', 'Average (3)', 'Excellent (4-5)'],
    datasets: [
      {
        data: [
          reviews.filter(r => r.overallScore <= 2).length,
          reviews.filter(r => r.overallScore === 3).length,
          reviews.filter(r => r.overallScore >= 4).length,
        ],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Performance Distribution</h3>
      <div className="h-64">
        <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default PerformanceChart;