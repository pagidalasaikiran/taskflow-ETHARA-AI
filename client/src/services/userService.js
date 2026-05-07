import api from './api';
import { API_ENDPOINTS } from '../constants';

export const userService = {
  getAll: () => api.get(API_ENDPOINTS.USERS),
  getTeam: () => api.get(API_ENDPOINTS.TEAM),
};
