import api from './api';

export const EmployeeService = {
    async getPerformanceReviews(employeeId = null) {
        const res = await api.get('/performance', {
          params: employeeId ? { employeeId } : {},
        });
        return res.data;
    },

  async getEmployeeById(Id) {
    const response = await api.get(`/employees/${Id}`);
    return response.data;
  },

  async createPerformanceReview(reviewData) {
    const response = await api.post('/performance', reviewData);
    return response.data;
  },

  async updatePerformanceReview(reviewId, updates) {
    const response = await api.patch(`/performance/${reviewId}`, updates);
    return response.data;
  },

  async getGoals(employeeId) {
    const response = await api.get(`/goals?employeeId=${employeeId}`);
    return response.data;
  },

  async submitFeedback(feedbackData) {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },
};

const getAllPerformanceReviews = () => api.get('/employees/performance-reviews');

export default {
  EmployeeService,
  getAllPerformanceReviews,
};