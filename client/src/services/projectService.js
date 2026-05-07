import api from './api';
import { API_ENDPOINTS } from '../constants';

export const projectService = {
  getAll: (params) => api.get(API_ENDPOINTS.PROJECTS, { params }),
  getById: (id) => api.get(`${API_ENDPOINTS.PROJECTS}/${id}`),
  create: (data) => api.post(API_ENDPOINTS.PROJECTS, data),
  update: (id, data) => api.put(`${API_ENDPOINTS.PROJECTS}/${id}`, data),
  delete: (id) => api.delete(`${API_ENDPOINTS.PROJECTS}/${id}`),
  addMember: (id, userId) => api.post(`${API_ENDPOINTS.PROJECTS}/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`${API_ENDPOINTS.PROJECTS}/${id}/members/${userId}`),
};
