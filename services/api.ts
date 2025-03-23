import axios from 'axios';
import { API_URL } from '@/config/config';

// Create an instance with the baseURL
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Store the original request to retry it later
    const originalRequest = error.config;
    
    console.log(`❌ API Error: ${error.response?.status} on ${originalRequest.url}`);
    
    // Only handle 401 errors (unauthorized) that haven't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Token expired, attempting to refresh');
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('❌ No refresh token available, redirecting to login');
          // No refresh token, force logout
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Attempt to get a new token
        console.log('📤 Sending refresh token request');
        // We use axios directly here (not api instance) to avoid circular dependency
        const refreshResponse = await axios.post(`${API_URL}/users/refresh-token`, { refreshToken });
        
        if (refreshResponse.data.success) {
          console.log('✅ Token refresh successful');
          
          // Save the new tokens
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
          
          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          console.log('❌ Refresh response unsuccessful');
          throw new Error('Refresh token failed');
        }
      } catch (refreshError) {
        console.error('🚨 Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Give time for logging before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return Promise.reject(refreshError);
      }
    }
    
    // Return any other errors
    return Promise.reject(error);
  }
);

export default api; 