'use client';

/**
 * Uploads an image file to Cloudinary via our server API route (signed upload)
 * @param file The file to upload
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    console.log('Starting Cloudinary upload via API for file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Fix the API path - it should have /api/ prefix
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Cloudinary upload failed:', data);
      throw new Error(`Upload failed: ${data.error || 'Unknown error'}`);
    }
    
    console.log('Upload successful. URL:', data.url);
    return data.url;
  } catch (error) {
    console.error('Error in upload:', error);
    throw error;
  }
}

/**
 * Uploads multiple image files to Cloudinary via our server API route
 * @param files Array of files to upload
 * @returns Promise resolving to an array of secure URLs
 */
export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  try {
    console.log(`Starting upload of ${files.length} files to Cloudinary`);
    
    // Create an array of promises for each file upload
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    
    // Wait for all uploads to complete
    const urls = await Promise.all(uploadPromises);
    
    console.log('All uploads completed successfully');
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}