import { v2 as cloudinary } from 'cloudinary';

// Add diagnostic logs for configuration
console.log('Cloudinary Configuration:');
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('API Key Set:', process.env.CLOUDINARY_API_KEY ? 'YES' : 'NO');
console.log('API Secret Set:', process.env.CLOUDINARY_API_SECRET ? 'YES' : 'NO');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Function to upload an image to Cloudinary
export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    console.log('Starting Cloudinary upload for file:', file.name, 'Size:', file.size);
    
    // Verify we're in a browser environment
    if (typeof window === 'undefined') {
      console.error('Error: Attempting to use uploadToCloudinary in a server context');
      throw new Error('Cannot upload to Cloudinary from server context');
    }
    
    // Convert file to base64 string
    console.log('Converting file to base64...');
    const base64data = await fileToBase64(file);
    console.log('Base64 conversion complete. Length:', base64data.length);
    
    console.log('Uploading to Cloudinary...');
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64data,
        {
          folder: 'moutouri',
          resource_type: 'image',
          quality: 'auto',
          format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
            return;
          }
          
          console.log('Cloudinary upload successful. Result:', result);
          // Return the secure URL of the uploaded image
          resolve(result?.secure_url || '');
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
}

// Helper function to convert a file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log('FileReader onload triggered');
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
  });
}

// Create a client-side only version that's safe to use in components
export function clientUploadToCloudinary(file: File): Promise<string> {
  // This is a wrapper that ensures we're only calling this on the client
  if (typeof window === 'undefined') {
    console.error('Attempted to use clientUploadToCloudinary on the server');
    return Promise.reject(new Error('Cannot upload from server context'));
  }
  
  return uploadToCloudinary(file);
}

// Rest of your code...