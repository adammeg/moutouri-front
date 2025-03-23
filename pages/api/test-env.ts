import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only log environment variables that are safe to expose
  const envVars = {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'NOT SET',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    NEXT_PUBLIC_IMAGE_BASE_URL: process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'NOT SET',
    CLOUDINARY_API_KEY_SET: process.env.CLOUDINARY_API_KEY ? 'YES' : 'NO',
    CLOUDINARY_API_SECRET_SET: process.env.CLOUDINARY_API_SECRET ? 'YES' : 'NO',
    NODE_ENV: process.env.NODE_ENV,
  };
  
  res.status(200).json({ 
    message: 'Environment variables check',
    env: envVars
  });
} 