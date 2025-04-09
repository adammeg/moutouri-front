import axios from 'axios';
import { API_URL } from '@/config/config';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// List of public endpoints that don't need authentication
const publicEndpoints = [
  '/products',
  '/products/search',
  '/products/suggestions', 
  '/products/latest',
  '/categories'
];

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Determine if this is a public endpoint (but exclude creating new products)
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint) && 
      !config.url.includes('/products/new') &&
      config.method !== 'post'
    );
    
    // Skip auth for public endpoints
    if (!isPublicEndpoint) {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (expired token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, { 
            refreshToken 
          });
          
          if (refreshResponse.data.success) {
            // Save new tokens
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
            
            // Update auth header and retry
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return api(originalRequest);
          }
        }
        
        // If refresh failed, clear auth and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login only if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login only if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 