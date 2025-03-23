'use client';

// This file contains only browser-compatible code for Cloudinary uploads

/**
 * Uploads an image file to Cloudinary using their REST API
 * @param file The image file to upload
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    console.log('Starting client-side Cloudinary upload for file:', file.name, 'Size:', file.size);
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    // Debug logs
    console.log('Upload preset:', uploadPreset || 'NOT SET');
    console.log('Cloud name:', cloudName || 'NOT SET');
    
    if (!uploadPreset) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not defined');
    }
    
    if (!cloudName) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
    }
    
    // Create a FormData object for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // Upload directly to Cloudinary using their REST API
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    console.log('Uploading to Cloudinary REST API:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', response.status, errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful. URL:', data.secure_url);
    
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// Rest of the file remains the same...

/**
 * Helper function to generate a Cloudinary URL with transformations
 */
export function getOptimizedImageUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
} = {}): string {
  // If not a Cloudinary URL, return as is
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  // Extract base URL and path
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return url;
  }
  
  const baseUrl = urlParts[0] + '/upload/';
  const imagePath = urlParts[1];
  
  // Build transformation string
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  // If no transformations specified, use auto optimization
  if (transformations.length === 0) {
    transformations.push('q_auto', 'f_auto');
  }
  
  // Build URL with transformations
  return `${baseUrl}${transformations.join(',')}/${imagePath}`;
}