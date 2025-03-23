import axios from 'axios';
import { API_URL } from '@/config/config';
// Remove the import from cloudinary.ts which is causing the error
// import { uploadToCloudinary } from '@/lib/cloudinary';

// Get all products with optional filters
export const getProducts = async (filters = {}) => {
  console.log("Searching products with filters:", filters);
  const response = await axios.get(`${API_URL}/products`, { params: filters });
  console.log("Search results:", response.data);
  return response.data;
};

// Get latest products
export const getLatestProducts = async (limit = 6) => {
  console.log("Fetching latest products, limit:", limit);
  const response = await axios.get(`${API_URL}/products/latest`, { params: { limit } });
  console.log("Latest products response:", response.data);
  return response.data;
};

// Get products by category
export const getProductsByCategory = async (categoryId: string) => {
  const response = await axios.get(`${API_URL}/categories/${categoryId}/products`);
  return response.data;
};

// Get user's products
export const getUserProducts = async (userId: string) => {
  console.log("Fetching products for user:", userId);
  const response = await axios.get(`${API_URL}/users/${userId}/products`);
  console.log("User products response:", response.data);
  return response.data;
};

// Get product details
export const getProductDetails = async (productId: string) => {
  try {
    console.log(`Fetching details for product: ${productId}`);
    const response = await axios.get(`${API_URL}/products/${productId}`);
    console.log("Product details response:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching product details for ID ${productId}:`, error);
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const errorWithResponse = error as { response?: { data?: unknown } };
      return errorWithResponse.response?.data || {
        success: false,
      };
    }
    return {
      success: false,
      message: 'Failed to fetch product details'
    };
  }
};

// Function to create a new product (simplified - no direct file handling)
export const createProduct = async (productData: any) => {
  try {
    // Send the product data to your API
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (productId: string, productData: FormData) => {
  const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a product
export const deleteProduct = async (productId: string) => {
  const response = await axios.delete(`${API_URL}/products/${productId}`);
  return response.data;
};