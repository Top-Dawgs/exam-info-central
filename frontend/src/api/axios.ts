
import axios from 'axios';

// Create an Axios instance with a base URL pointing to your backend
const API = axios.create({
  baseURL: 'http://localhost:3000', // This matches your backend port
});

// Add a request interceptor to include JWT token in headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
