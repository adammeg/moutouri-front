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
  try {
    console.log(`Fetching products for user: ${userId}`);
    const response = await axios.get(`${API_URL}/users/${userId}/products`);
    console.log("User products response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user products:', error);
    return { 
      success: false, 
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch your products'
    };
  }
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
// Update the updateProduct function to properly include the auth token
export const updateProduct = async (productId: string, productData: any) => {
  try {
    // Get the auth token from localStorage
    let token = null;
    if (typeof window !== 'undefined') {
      // Try to get token directly if available
      token = localStorage.getItem('accessToken');
      
      // If not found, try to get from user object
      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          token = userData.token || userData.accessToken;
        }
      }
    }

    // Set up headers with authentication token
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Using auth token for update request');
    } else {
      console.warn('⚠️ No auth token found for product update request');
    }

    // If there are new images to upload, handle them first
    if (productData.newImages && productData.newImages.length > 0) {
      const formData = new FormData();
      
      // Append each image to the form data
      productData.newImages.forEach((image: File, index: number) => {
        formData.append('images', image);
      });
      
      // Set auth header for image upload request too
      const uploadHeaders: any = {
        'Content-Type': 'multipart/form-data',
      };
      
      if (token) {
        uploadHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      // Upload images first
      const imageUploadResponse = await axios.post(`${API_URL}/upload/multiple`, formData, {
        headers: uploadHeaders,
        withCredentials: true
      });
      
      if (imageUploadResponse.data.success) {
        // Add new image URLs to existing images
        const newImageUrls = imageUploadResponse.data.imageUrls;
        productData.images = [...productData.images, ...newImageUrls];
      }
    }
    
    // Remove the newImages property before sending to API
    delete productData.newImages;
    
    // Send the update request with explicit auth header
    console.log(`Updating product ${productId} with auth token`);
    const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
      headers,
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update product'
    };
  }
};

// Delete a product
export const deleteProduct = async (productId: string) => {
  const response = await axios.delete(`${API_URL}/products/${productId}`);
  return response.data;
};

// Add this function to your products.ts file to export getProductById
// You can simply alias the existing getProductDetails function

export const getProductById = async (productId: string) => {
  console.log(`[getProductById] Fetching product with ID: ${productId}`);
  return getProductDetails(productId);
};

// Add to your products.ts service file
export const searchProductSuggestions = async (query: string) => {
  try {
    if (!query || query.length < 2) {
      return { success: true, suggestions: [] };
    }
    
    const response = await axios.get(`${API_URL}/products/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return { 
      success: false, 
      suggestions: [],
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch suggestions'
    };
  }
};

// Add or update the searchProducts function
export const searchProducts = async (query: any, filters = {}) => {
  try {
    console.log(`🔍 Searching for: "${query}" with filters:`, filters);
    
    const params = {
      search: query,
      ...filters
    };
    
    const response = await axios.get(`${API_URL}/products/search`, { params });
    
    console.log(`🔍 Found ${response.data?.products?.length || 0} results for "${query}"`);
    return response.data;
  } catch (error) {
    console.error("❌ Error in product search:", error);
    return {
      success: false,
      message: "Search failed",
      products: []
    };
  }
};