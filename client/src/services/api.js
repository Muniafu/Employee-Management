const base = 'http://localhost:5000/api';

// Helper function for API requests
const apiRequest = async (method, url, data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${base}${url}`, config);
  return response.json();
};

// General API methods
export const get = (url, token) => apiRequest('GET', url, null, token);
export const post = (url, data, token) => apiRequest('POST', url, data, token);
export const patch = (url, data, token) => apiRequest('PATCH', url, data, token);
export const put = (url, data, token) => apiRequest('PUT', url, data, token);
export const del = (url, token) => apiRequest('DELETE', url, null, token);

// Specific API methods
export const getMetrics = (token) => apiRequest('GET', '/metrics', null, token);
export const createMetric = (data, token) => apiRequest('POST', '/metrics', data, token);
export const updateMetric = (id, data, token) => apiRequest('PUT', `/metrics/${id}`, data, token);
export const deleteMetric = (id, token) => apiRequest('DELETE', `/metrics/${id}`, null, token);

export const getGoals = (token) => apiRequest('GET', '/goals', null, token);
export const createGoal = (data, token) => apiRequest('POST', '/goals', data, token);
export const updateGoal = (id, data, token) => apiRequest('PUT', `/goals/${id}`, data, token);
export const deleteGoal = (id, token) => apiRequest('DELETE', `/goals/${id}`, null, token);

export const getFeedback = (token) => apiRequest('GET', '/feedbacks', null, token);
export const createFeedback = (data, token) => apiRequest('POST', '/feedbacks', data, token);
export const updateFeedback = (id, data, token) => apiRequest('PUT', `/feedbacks/${id}`, data, token);
export const deleteFeedback = (id, token) => apiRequest('DELETE', `/feedbacks/${id}`, null, token);

export const getUsers = (token) => apiRequest('GET', '/auth/users', null, token);
export const approveUser = (id, token) => apiRequest('PATCH', `/auth/${id}/approve`, {}, token);
export const rejectUser = (id, token) => apiRequest('PATCH', `/auth/${id}/reject`, {}, token);