import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Explicit configuration with hardcoded fallback for development
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dzamzt9og';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Debug info (will appear in server logs)
console.log('Cloudinary API Route - Environment Check:');
console.log('- CLOUD_NAME:', cloudName);
console.log('- API_KEY exists:', !!apiKey);
console.log('- API_SECRET exists:', !!apiSecret);

// Configure Cloudinary with explicit values
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: NextRequest) {
  try {
    // Verify Cloudinary configuration
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials in API route');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error: Missing Cloudinary credentials' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Log what we're trying to upload
    console.log(`Attempting to upload file: ${file.name}, size: ${file.size} bytes`);
    console.log(`Using cloud name: ${cloudName}`);
    
    try {
      // Upload to Cloudinary with proper signing
      const result = await cloudinary.uploader.upload(base64String, {
        folder: 'moutouri',
        resource_type: 'auto',
      });
      
      console.log('Upload successful, URL:', result.secure_url);
      
      return NextResponse.json({ 
        success: true, 
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error details:', cloudinaryError);
      return NextResponse.json({ 
        success: false, 
        error: cloudinaryError instanceof Error ? cloudinaryError.message : 'Cloudinary upload failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 