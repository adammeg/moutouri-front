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
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found in localStorage');
      return {
        success: false,
        message: 'Authentication token not found'
      };
    }
    
    console.log('Making admin stats request with token');
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    const errorMsg = axios.isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : 'Failed to fetch admin statistics';
      
    return {
      success: false,
      message: errorMsg
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