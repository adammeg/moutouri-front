import axios from 'axios';
import { API_URL } from '@/config/config';

// Type definitions for admin dashboard
export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  recentUsers: any[];
  recentProducts: any[];
  productsByCategory: any[];
  monthlyRegistrations: any[];
  monthlySales: any[];
}

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async (params = {}) => {
  const response = await axios.get(`${API_URL}/users`, { 
    params 
  });
  return response.data;
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