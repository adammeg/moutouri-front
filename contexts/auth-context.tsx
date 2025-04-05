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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        setIsLoading(true)
        
        // Get user from localStorage
        const userStr = localStorage.getItem('user')
        console.log('🔍 Checking stored user:', userStr ? 'Found' : 'Not found')
        
        if (userStr) {
          // Parse the user data
          const userData = JSON.parse(userStr)
          
          // Extract token from user data or separate storage
          const accessToken = localStorage.getItem('accessToken')
          const refreshToken = localStorage.getItem('refreshToken')
          const token = userData.token || accessToken
          
          console.log('🔑 Token found:', token ? 'Yes' : 'No')
          console.log('📋 User data keys:', Object.keys(userData))
          
          // Create a properly structured user object
          const normalizedUser: User = {
            _id: userData.id || userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            token: token || undefined,
            accessToken: accessToken || undefined,
            image: userData.image,
            isAdmin: userData.role === 'admin'
          }
          console.log('✅ User ID:', normalizedUser._id)
          
          // Set auth state
          setUser(normalizedUser)
          setIsAdmin(normalizedUser.role === 'admin')
          setToken(token)
          
          // Set axios auth header if token exists
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error initializing auth state:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  // Login handler
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success && response.data.token) {
        // Save token to both state and localStorage
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        console.log('🔑 Token saved to localStorage');
        
        const userData = response.data.user
        const token = response.data.token || response.data.accessToken
        
        // Create the complete user object with token, ensuring _id is set correctly
        const completeUser = {
          ...userData,
          _id: userData.id || userData._id,
          token: token,
          isAdmin: userData.role === 'admin'
        }
        
        console.log('✅ Login - User ID:', completeUser._id)
        
        // Set auth state
        setUser(completeUser)
        setIsAdmin(completeUser.isAdmin)
        
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(completeUser))
        
        // Save tokens separately if needed
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken)
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        
        // Set axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
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
      const response = await axios.post(`${API_URL}/users/register`, userData)
      
      if (response.data.success) {
        const token = response.data.token || response.data.accessToken
        
        // Create complete user object with token
        const user = {
          ...response.data.user,
          token: token,
          isAdmin: response.data.user.role === 'admin'
        }
        
        // Set auth state
        setUser(user)
        setIsAdmin(user.isAdmin)
        
        // Save user data and tokens
        localStorage.setItem('user', JSON.stringify(user))
        
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken)
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        
        // Set axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
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
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Clear axios auth header
    delete axios.defaults.headers.common['Authorization']
    
    // Redirect to login page
    router.push('/login')
  }

  // Get auth token helper
  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      // First try to get from state
      if (token) return token;
      
      // Then try to get from localStorage
      const storedToken = localStorage.getItem('token');
      console.log('🔑 Retrieved token from localStorage:', storedToken ? 'Found' : 'Not found');
      
      // If found in localStorage but not in state, update state
      if (storedToken && !token) {
        // Update state with token for future use
        setToken(storedToken);
      }
      
      return storedToken;
    }
    return null;
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
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 