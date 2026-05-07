import api from './api';
import { API_ENDPOINTS } from '../constants';

export const activityService = {
  getRecent: (limit = 20) => api.get(API_ENDPOINTS.ACTIVITIES, { params: { limit } }),
};
