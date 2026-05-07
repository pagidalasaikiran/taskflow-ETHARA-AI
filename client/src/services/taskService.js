import api from './api';
import { API_ENDPOINTS } from '../constants';

export const taskService = {
  getAll: (params) => api.get(API_ENDPOINTS.TASKS, { params }),
  getById: (id) => api.get(`${API_ENDPOINTS.TASKS}/${id}`),
  create: (data) => api.post(API_ENDPOINTS.TASKS, data),
  update: (id, data) => api.put(`${API_ENDPOINTS.TASKS}/${id}`, data),
  delete: (id) => api.delete(`${API_ENDPOINTS.TASKS}/${id}`),
  getByProject: (projectId, params) => api.get(`${API_ENDPOINTS.TASKS}/project/${projectId}`, { params }),
  getStats: () => api.get(API_ENDPOINTS.TASK_STATS),
};
