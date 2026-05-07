export const config = {
  API_BASE_URL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '') + '/',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow',
};
