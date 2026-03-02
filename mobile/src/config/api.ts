export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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