const LOCAL_IP = 'localhost';

export const API_BASE_URL = __DEV__ 
  ? `http://localhost:3000`
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  health: '/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
  },
  users: {
    me: '/api/users/me',
    updateMe: '/api/users/me',
    byId: (id: string) => `/api/users/${id}`,
    entries: (id: string) => `/api/users/${id}/entries`,
  },
  entries: {
    list: '/api/entries',
    create: '/api/entries',
    detail: (id: string) => `/api/entries/${id}`,
  },
};