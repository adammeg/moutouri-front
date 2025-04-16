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
  isAdmin?: boolean
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

// FIXED: Create a consistent function for token management
const tokenStorage = {
  setTokens: (accessToken: string, refreshToken: string, user: any) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify({
      ...user,
      accessToken // Store token in user object for compatibility
    }));
    console.log("🔑 Tokens saved to storage", { 
      accessTokenLength: accessToken.length,
      refreshTokenLength: refreshToken.length 
    });
  },
  
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log("🧹 Auth tokens cleared");
  },
  
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },
  
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
};

// Interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("🚨 API Error:", { 
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      retrying: !!originalRequest?._retry
    });
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest?._retry) {
      console.log("🔄 Attempting token refresh");
      originalRequest._retry = true;
      
      try {
        // Get refresh token from localStorage
        const refreshToken = tokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          console.log("❌ No refresh token available");
          tokenStorage.clearTokens(); // Clean up any partial auth state
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
          tokenStorage.setTokens(
            response.data.accessToken,
            response.data.refreshToken,
            tokenStorage.getUser()
          );
          
          // Update authorization header
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          
          console.log("🔄 Retrying original request");
          // Retry original request
          return axios(originalRequest);
        } else {
          console.log("❌ Token refresh failed with success: false");
          tokenStorage.clearTokens();
        }
      } catch (refreshError) {
        console.error("🚨 Token refresh error:", refreshError);
        tokenStorage.clearTokens();

        // Don't redirect here - let the Auth Provider handle it
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Safe check for token in a way that works on both client and server
    const checkAuth = async () => {
      setIsLoading(true);
      console.log("🔍 Checking authentication state");
      try {
        // Check for token in localStorage (client-side only)
        const storedToken = typeof window !== 'undefined' ? tokenStorage.getAccessToken() : null;
        const storedUser = typeof window !== 'undefined' ? tokenStorage.getUser() : null;
        
        if (!storedToken || !storedUser) {
          console.log("👤 No stored credentials found");
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          return;
        }
        
        // Token exists, try to parse user
        try {
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsAdmin(storedUser.role === 'admin');
          console.log("👤 User authenticated from storage:", { 
            id: storedUser._id,
            role: storedUser.role,
            isAdmin: storedUser.role === 'admin' 
          });
          
          // Set auth header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          
          // Invalid user data, clear storage
          tokenStorage.clearTokens();
          
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log(`📝 Attempting login for: ${email}`)
      
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      })
      
      console.log('Login response:', response.data.success ? 'Success' : 'Failed')
      
      if (response.data.success) {
        // FIXED: Consistent token storage
        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        
        // Create complete user object
        const user = {
          ...response.data.user,
          isAdmin: response.data.user.role === 'admin'
        }
        
        // Set auth state
        setUser(user)
        setIsAuthenticated(true)
        setIsAdmin(user.isAdmin)
        
        // Save tokens consistently
        tokenStorage.setTokens(accessToken, refreshToken, user);
        
        // Set axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        return { success: true, message: 'Login successful' }
      } else {
        return { success: false, message: response.data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message 
          : 'Connection error' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Register handler
  const register = async (userData: any) => {
    try {
      setIsLoading(true)
      console.log('Registering user:', {...userData, password: '[REDACTED]'})
      
      const response = await axios.post(`${API_URL}/users/register`, userData)
      
      console.log('Registration response:', response.data.success ? 'Success' : 'Failed')
      
      if (response.data.success) {
        // FIXED: Consistent token storage
        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        
        // Create complete user object with token
        const user = {
          ...response.data.user,
          isAdmin: response.data.user.role === 'admin'
        }
        
        // Set auth state
        setUser(user)
        setIsAdmin(user.isAdmin)
        setIsAuthenticated(true)
        
        // Save tokens consistently
        tokenStorage.setTokens(accessToken, refreshToken, user);
        
        // Set axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        return { success: true, message: 'Registration successful' }
      } else {
        return { success: false, message: response.data.message || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message 
          : 'Connection error' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout handler
  const logout = () => {
    // Clear auth state
    setUser(null)
    setIsAdmin(false)
    setIsAuthenticated(false)
    
    // Clear localStorage
    tokenStorage.clearTokens();
    
    // Clear axios auth header
    delete axios.defaults.headers.common['Authorization']
    
    // Redirect to login page
    router.push('/login')
  }

  // Get auth token helper - FIXED: More consistent implementation
  const getAuthToken = (): string | null => {
    return tokenStorage.getAccessToken();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 