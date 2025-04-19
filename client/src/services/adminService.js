import { toast } from 'react-toastify';
import api from './api';

export const AdminService = {
  async getAllEmployees() {
    try {
      const response = await api.get('/admin/employees');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error fetching employees');
      throw error;
    }
  },

  async createEmployee(employeeData) {
    const response = await api.post('/admin/employees', employeeData);
    toast.success('Employee created successfully!');
    return response.data;
  },

  async updateEmployee(employeeId, updates) {
    const response = await api.put(`/admin/employees/${employeeId}`, updates);
    return response.data;
  },

async deleteEmployee(employeeId) {
  try {
    const response = await api.delete(`/admin/employees/${employeeId}`);
    return response.data;
  } catch (error) {
    toast.error('Error deleting employee');
    throw error;
  }
},

  async generatePerformanceReport(params) {
    const response = await api.get('/admin/reports/performance', { params });
    return response.data;
  },

  async bulkUpdatePerformance(updates) {
    const response = await api.post('/admin/performance/bulk', updates);
    return response.data;
  },
};