import axios from 'axios';
import { API_URL } from '@/config/config';

// Register user
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}) => {
  try {
    console.log('Registering user with data:', { ...userData, password: '[REDACTED]' });
    const response = await axios.post(`${API_URL}/users/register`, userData);
    console.log('Registration response:', response.data);
    
    // Store tokens if registration successful
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set auth header
      setAuthHeader(response.data.accessToken);
    }
    
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    const errorResponse = axios.isAxiosError(error) ? error.response?.data : null;
    
    console.error('Registration error:', errorResponse || errorMessage);
    return {
      success: false,
      message: errorResponse?.message || 'Une erreur est survenue lors de l\'inscription',
    };
  }
};

// Login user
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    console.log(`Attempting login for user: ${credentials.email}`);
    const response = await axios.post(`https://moutouri-back.onrender.com/users/login`, credentials);
    console.log('Login successful:', response.data);
    
    // Store tokens if login successful
    if (response.data.success && response.data.token) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Set auth header
      setAuthHeader(response.data.accessToken);
    }
    
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    const errorResponse = axios.isAxiosError(error) ? error.response?.data : null;
    
    console.error('Login error:', errorResponse || errorMessage);
    return {
      success: false,
      message: errorResponse?.message || 'Email ou mot de passe incorrect',
    };
  }
};

// Logout user
export const logoutUser = () => {
  console.log('Logging out user');
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  setAuthHeader(null);
  
  return {
    success: true,
    message: 'Déconnexion réussie',
  };
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// Set auth header for axios requests
export const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Function to refresh the token
export const refreshToken = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user || !user.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_URL}/users/refresh-token`, {
      refreshToken: user.refreshToken,
    });
    
    // Update the stored token
    if (response.data.success && response.data.token) {
      localStorage.setItem('user', JSON.stringify({
        ...user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      }));
    }
    
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    const errorResponse = axios.isAxiosError(error) ? error.response?.data : null;
    
    console.error('Token refresh error:', errorResponse || errorMessage);
    return {
      success: false,
        message: errorResponse?.message || 'Erreur lors de la mise à jour de l\'authentification',
    };
  }
};

// Check if a user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user && !!user.token;
};

// Check if a user is an admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return !!user && !!user.isAdmin;
}; 