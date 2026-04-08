import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);

export const getStations = () => api.get('/stations');
export const getStation = (id) => api.get(`/stations/${id}`);
export const createStation = (data) => api.post('/stations', data);
export const updateStation = (id, data) => api.patch(`/stations/${id}`, data);
export const deleteStation = (id) => api.delete(`/stations/${id}`);

export const getAdmins = () => api.get('/users/admins');

export default api;
