import { createContext, useState } from 'react';
import { EmployeeService } from '../services/employeeService';
import { useAuth } from './AuthContext';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all employees (for managers/admins)
  const fetchEmployees = async () => {
    if (!['admin', 'manager'].includes(user.role)) return;

    setLoading(true);
    try {
      const res = await EmployeeService.getAllEmployees();
      setEmployees(res.data);
    } catch (err) {
        err.response?.data?.message || 'Failed to fetch employees',
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance reviews
  const fetchPerformanceReviews = async (employeeId = null, phase = null) => {
    try {
      const reviewStatusData = await EmployeeService.getReviewStatus(employeeId);
      fetchReviewsStatus(reviewStatusData);
        
      setLoading(true);
      const effectiveEmployeeId = user.role === 'employee' ? user._id : employeeId;
      const res = await EmployeeService.getPerformanceReviews(effectiveEmployeeId, phase);
      setPerformanceReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsStatus = async (employeeId) => {
    try {
      const data = await EmployeeService.getReviewStatus(employeeId);
      fetchReviewsStatus(data);
    } catch (error) {
      console.error('Failed to fetch review status:', error);
    }
  };

  const updateReview = async (reviewId, updates) => {
    try {
      const updatedReview = await EmployeeService.updatePerformanceReview(reviewId, updates);
      setPerformanceReviews(prev => 
        prev.map(review => review._id === reviewId ? updatedReview : review)
      );
      return updatedReview;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  const exportReviewPDF = async (reviewId) => {
    try {
      await EmployeeService.exportReviewToPDF(reviewId);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        performanceReviews,
        loading,
        fetchEmployees,
        fetchPerformanceReviews,
        fetchReviewsStatus,
        updateReview,
        exportReviewPDF,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export default EmployeeContext;