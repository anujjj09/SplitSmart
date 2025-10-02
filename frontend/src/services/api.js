import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    console.error('API Error Status:', error.response?.status);
    console.error('API Error Config:', error.config);
    return Promise.reject(error);
  }
);

// Group API endpoints
export const groupAPI = {
  // Get all groups
  getAll: () => api.get('/groups'),
  
  // Get single group by ID
  getById: (groupId) => api.get(`/groups/${groupId}`),
  
  // Create new group
  create: (groupData) => api.post('/groups', groupData),
  
  // Update group
  update: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),
  
  // Delete group
  delete: (groupId) => api.delete(`/groups/${groupId}`),
  
  // Add member to group
  addMember: (groupId, memberData) => api.post(`/groups/${groupId}/members`, memberData),
  
  // Remove member from group
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
  
  // Get group balances
  getBalances: (groupId) => api.get(`/groups/${groupId}/balances`),
  
  // Export group data
  export: (groupId, type = 'expenses') => 
    api.get(`/groups/${groupId}/export?type=${type}`, { responseType: 'blob' }),
};

// Expense API endpoints
export const expenseAPI = {
  // Get all expenses (optionally filtered by group)
  getAll: (groupId) => api.get('/expenses', { params: groupId ? { groupId } : {} }),
  
  // Get single expense by ID
  getById: (expenseId) => api.get(`/expenses/${expenseId}`),
  
  // Create new expense
  create: (groupId, expenseData) => api.post(`/groups/${groupId}/expenses`, expenseData),
  
  // Update expense
  update: (expenseId, expenseData) => api.put(`/expenses/${expenseId}`, expenseData),
  
  // Delete expense
  delete: (expenseId) => api.delete(`/expenses/${expenseId}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error?.message || 'An error occurred';
    return {
      message,
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

export default api;