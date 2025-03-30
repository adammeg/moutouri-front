import axios from 'axios';
import { API_URL } from '@/config/config';

// Type definitions for admin dashboard
export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  recentUsers: any[];
  recentProducts: any[];
  productsPerCategory: any[];
  activeListings: number;
  pendingListings: number;
}

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    console.log("📡 getAdminStats: Starting API request");
    
    // Get user token from localStorage
    const userString = localStorage.getItem('user');
    console.log("🧾 User data in localStorage:", userString ? "Found" : "Not found");
    
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.accessToken || user?.token;
    
    console.log("🔑 Token from localStorage:", token ? `${token.substring(0, 10)}...` : "Not found");
    
    if (!token) {
      console.error('❌ No authentication token found');
      return { 
        success: false, 
        message: 'No authentication token' 
      };
    }
    
    console.log('📤 Fetching admin stats with token:', token.substring(0, 15) + '...');
    console.log('🔗 Request URL:', `${API_URL}/admin/stats`);
    
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Log the response for debugging
    console.log('📥 Admin stats response status:', response.status);
    console.log('📊 Admin stats response data:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Admin stats retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    
    // Extract more detailed error information
    const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : 'Could not retrieve admin statistics';
    
    const statusCode = axios.isAxiosError(error) && error.response?.status
      ? error.response.status
      : 'unknown';
      
    console.error(`❗ API error (${statusCode}):`, errorMessage);
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.accessToken || user?.token;
    
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: 'Could not fetch users'
    };
  }
};

// Get all products for admin
export const getAllProducts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/admin/products`, {
    params
  });
  return response.data;
};

// Update user role
export const updateUserRole = async (userId: string, role: string) => {
  const response = await axios.put(`${API_URL}/users/${userId}/role`, { role });
  return response.data;
};

// Deactivate/activate user
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const response = await axios.put(`${API_URL}/users/${userId}/status`, { isActive });
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${API_URL}/users/${userId}`);
  return response.data;
};

// Verify product
export const verifyProduct = async (productId: string, isVerified: boolean) => {
  const response = await axios.put(`${API_URL}/admin/products/${productId}/verify`, { isVerified });
  return response.data;
};

// Feature product
export const featureProduct = async (productId: string, isFeatured: boolean) => {
  const response = await axios.put(`${API_URL}/admin/products/${productId}/feature`, { isFeatured });
  return response.data;
};

// Delete product (admin version)
export const adminDeleteProduct = async (productId: string) => {
  const response = await axios.delete(`${API_URL}/admin/products/${productId}`);
  return response.data;
}; 