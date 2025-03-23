"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '@/config/config'

// Auth context types
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  image?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
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
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin'
  
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔍 Auth initialization started");
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      
      console.log("📦 Stored tokens:", { 
        accessTokenExists: !!accessToken, 
        refreshTokenExists: !!refreshToken,
        userExists: !!userStr,
      });
      
      try {
        if (userStr && accessToken) {
          // Always set user from localStorage first to ensure we have a user even if API calls fail
          const storedUser = JSON.parse(userStr);
          setUser(storedUser);
          
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Try to validate token by fetching profile, but don't fail auth if this doesn't work
          try {
            console.log("🔄 Validating token with profile fetch");
            const response = await axios.get(`${API_URL}/users/profile`);
            
            if (response.data.success) {
              console.log("✅ Profile fetch successful, updating user");
              setUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          } catch (profileError) {
            console.log("⚠️ Profile fetch failed but continuing with stored user data");
            console.error(profileError);
            
            // Only attempt refresh if we got a 401 (unauthorized)
            if (axios.isAxiosError(profileError) && profileError.response?.status === 401) {
              if (refreshToken) {
                try {
                  console.log("🔄 Attempting token refresh");
                  const refreshResponse = await axios.post(`${API_URL}/users/refresh-token`, {
                    refreshToken,
                  });
                  
                  if (refreshResponse.data.success) {
                    console.log("✅ Token refresh successful");
                    localStorage.setItem('accessToken', refreshResponse.data.accessToken);
                    localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
                    
                    if (refreshResponse.data.user) {
                      setUser(refreshResponse.data.user);
                      localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
                    }
                  }
                } catch (refreshError) {
                  console.error('🚨 Failed to refresh token:', refreshError);
                  // Let auth continue with stored user info even if refresh fails
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('🚨 Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    initAuth()
  }, [])
  
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });
      
      console.log('📥 Login response received:', response.data);
      
      if (response.data.success) {
        // Extract data from response
        const { user: userData, accessToken, refreshToken } = response.data;
        
        console.log('✅ Login successful for user:', userData.email);
        console.log('🔑 Received tokens:', { 
          accessToken: accessToken ? `${accessToken.substring(0, 15)}...` : 'missing',
          refreshToken: refreshToken ? `${refreshToken.substring(0, 15)}...` : 'missing'
        });
        
        // Set user in state
        setUser(userData);
        
        // Store auth data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔒 Auth header set for future requests');
        
        return userData;
      } else {
        console.log('❌ Login failed:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  
  // Register function
  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData)
      
      if (response.data.success) {
        const newUser = response.data.user
        setUser(newUser)
        
        // Store auth data
        localStorage.setItem('user', JSON.stringify(newUser))
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  // Logout function
  const logout = async () => {
    try {
      // Call backend logout endpoint
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        await axios.post(
          `${API_URL}/users/logout`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data regardless of API response
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    }
  }
  
  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }
  
  // Add this computed property
  const isAuthenticated = !!user;
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 