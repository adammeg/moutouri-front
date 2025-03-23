'use client';

import { uploadMultipleToCloudinary } from '@/lib/cloudinary-client-with-signed-upload';
import axios from 'axios';
import { API_URL } from '@/config/config';

// Define expected product data interface
interface ProductData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  location?: string;
  // Add other fields as needed
}

// Client-side function to create a new product
export async function createProductWithImages(productData: ProductData, imageFiles: File[]) {
  try {
    console.log('Starting product creation with', imageFiles.length, 'images');
    console.log('Product data:', productData);
    
    // Validate required fields
    if (!productData.title || !productData.description || !productData.price || !productData.category) {
      throw new Error('Missing required product fields (title, description, price, or category)');
    }
    
    // Upload images to Cloudinary
    const imageUrls = await uploadMultipleToCloudinary(imageFiles);
    console.log('Images uploaded successfully:', imageUrls);
    
    // Add the Cloudinary URLs to the product data
    const productWithImages = {
      ...productData,
      images: imageUrls,
    };
    
    console.log('Sending complete product data to API:', productWithImages);
    
    // Send the product data with image URLs to your API
    const response = await axios.post(`${API_URL}/products`, productWithImages);
    console.log('Product created successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating product with images:', error);
    
    // Extract more specific error message from Axios error if possible
    const errorMessage = 
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : error instanceof Error
          ? error.message
          : 'Unknown error creating product';
    
    throw new Error(errorMessage);
  }
}