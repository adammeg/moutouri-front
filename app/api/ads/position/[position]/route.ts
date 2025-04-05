import { NextRequest, NextResponse } from 'next/server';
import { getAdsByPosition } from '@/services/ads';

interface RouteParams {
  params: {
    position: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const position = params.position;
    console.log(`API route called for ad position: ${position}`);
    
    const response = await getAdsByPosition(position);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in ads API route:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
} 