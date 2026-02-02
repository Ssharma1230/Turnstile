import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getToken, removeToken } from './auth';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - log user out
      await removeToken();
      // You can add navigation to login screen here later
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.auth.register, {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.auth.login, {
      email,
      password,
    });
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getMe: async () => {
    const response = await api.get(API_ENDPOINTS.users.me);
    return response.data;
  },

  updateMe: async (data: { username?: string; bio?: string; profile_photo_url?: string }) => {
    const response = await api.put(API_ENDPOINTS.users.updateMe, data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.users.byId(id));
    return response.data;
  },
};

export default api;