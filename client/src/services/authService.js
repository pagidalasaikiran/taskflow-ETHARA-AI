import api from './api';
import { API_ENDPOINTS } from '../constants';

export const authService = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (data) => api.post(API_ENDPOINTS.AUTH.REGISTER, data),
  getProfile: () => api.get(API_ENDPOINTS.AUTH.PROFILE),
};
