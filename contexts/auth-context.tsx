"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { API_URL } from '@/config/config'
import { useRouter } from 'next/navigation'

// Auth context types
interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  token?: string
  accessToken?: string
  image?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: any) => Promise<{ success: boolean; message: string }>
  logout: () => void
  getAuthToken: () => string | null
}

// Set up axios defaults
axios.defaults.withCredentials = true;
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("🚨 API Error:", { 
      status: error.response?.status,
      url: originalRequest.url,
      method: originalRequest.method,
      retrying: !!originalRequest._retry
    });
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 Attempting token refresh");
      originalRequest._retry = true;
      
      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log("❌ No refresh token available");
          return Promise.reject(error);
        }
        
        // Try to get a new token
        console.log("📤 Sending refresh token request");
        const response = await axios.post(`${API_URL}/users/refresh-token`, {
          refreshToken,
        });
        
        if (response.data.success) {
          console.log("✅ Token refresh successful");
          // Save new tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Update authorization header
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          
          console.log("🔄 Retrying original request");
          // Retry original request
          return axiosInstance(originalRequest);
        } else {
          console.log("❌ Token refresh failed with success: false");
        }
      } catch (refreshError) {
        console.error("🚨 Token refresh error:", refreshError);
        console.log("🚪 Redirecting to login");
        // If refresh fails, logout user
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Don't immediately redirect, log first
        console.log("🧹 Auth tokens cleared, will redirect to login");
        setTimeout(() => {
          window.location.href = '/login';
        }, 500); // Small delay to ensure logs are visible
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin'
  
  // Initialize auth state
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Check if the token exists
          const token = userData.accessToken || userData.token;
          
          if (token) {
            console.log("✅ Found stored user with token");
            
            // Validate token by fetching profile
            try {
              const response = await axios.get(`${API_URL}/users/profile`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              console.log("✅ Profile fetch successful, updating user");
              
              // Update user data with the most current info from the server
              const updatedUserData = {
                ...userData,
                ...response.data.user
              };
              
              // Make sure we preserve the token
              if (!updatedUserData.accessToken && !updatedUserData.token) {
                updatedUserData.token = token;
              }
              
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              setUser(updatedUserData);
            } catch (error) {
              console.error("❌ Token validation failed, logging out", error);
              // Token invalid, clear it
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            console.error("❌ No token found in stored user data");
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          console.log("❓ No stored user found");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error loading user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [])
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log(`🔒 Logging in user: ${email}`);
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      
      console.log('👤 Login response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        const token = userData.token || userData.accessToken;
        
        if (!token) {
          console.error('❌ No token in response data');
          return { 
            success: false, 
            message: 'Authentication failed: No token provided by server' 
          };
        }
        
        // Ensure we have an object that's safe to store
        const userToStore = {
          ...userData,
          token: token // Ensure token is included
        };
        
        console.log('💾 Storing user data:', userToStore);
        
        // Save user to state and localStorage
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        console.log('✅ User stored successfully');
        return { success: true, message: 'Login successful' };
      } else {
        console.error('❌ Login failed:', response.data.message);
        return { 
          success: false, 
          message: response.data.message || 'Invalid email or password' 
        };
      }
    } catch (error: any) {
      console.error('🚨 Login error:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'An error occurred during login';
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }
  
  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      
      const { success, message } = response.data;
      
      return { success, message };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during registration' 
      };
    } finally {
      setIsLoading(false);
    }
  }
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }
  
  // Helper to get current auth token
  const getAuthToken = (): string | null => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.accessToken || userData.token || null;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving auth token:", error);
      return null;
    }
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        getAuthToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 