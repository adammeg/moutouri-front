// If the file doesn't exist, create it with:
console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moutouri-back.onrender.com';

// Log the final API_URL value
console.log('Using API_URL:', API_URL);

// Additional configuration variables can be added here
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://moutouri-back.onrender.com/uploads/';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moutouri.vercel.app';
export const DEFAULT_AVATAR = '/placeholder.svg?height=200&width=200';