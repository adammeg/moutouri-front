import axios from 'axios';
import { API_URL } from '@/config/config';

// Type definition for Category
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all categories with better error handling
export const getCategories = async () => {
  try {
    console.log("Fetching all categories");
    const response = await axios.get(`${API_URL}/categories`);
    console.log("Categories response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return a standardized error response
    return {
      success: false,
      message: 'Failed to fetch categories',
      categories: [] // Empty array as fallback
    };
  }
};

// Get a single category by ID
export const getCategoryById = async (categoryId: string) => {
  const response = await axios.get(`${API_URL}/categories/${categoryId}`);
  return response.data;
};

// Get a single category by slug
export const getCategoryBySlug = async (slug: string) => {
  const response = await axios.get(`${API_URL}/categories/slug/${slug}`);
  return response.data;
};

// Get all products in a category
export const getCategoryProducts = async (categoryId: string, params = {}) => {
  const response = await axios.get(`${API_URL}/categories/${categoryId}/products`, { 
    params 
  });
  return response.data;
};

// Admin functions below

// Create a new category (admin only)
export const createCategory = async (categoryData: FormData) => {
  const response = await axios.post(`${API_URL}/categories`, categoryData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update a category (admin only)
export const updateCategory = async (categoryId: string, categoryData: FormData) => {
  const response = await axios.put(`${API_URL}/categories/${categoryId}`, categoryData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a category (admin only)
export const deleteCategory = async (categoryId: string) => {
  const response = await axios.delete(`${API_URL}/categories/${categoryId}`);
  return response.data;
}; 