import { NextRequest, NextResponse } from 'next/server';
import { getAdsByPosition } from '@/services/ads';

export async function GET(
  request: NextRequest,
  { params }: { params: { position: string }; }
) {
  try {
    const position = params.position;
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