import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.94:3101';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    
    // Forward query parameters
    if (searchParams.get('date')) {
      params.append('date', searchParams.get('date')!);
    }

    console.log('[DEBUG] Frontend API - Date parameter:', searchParams.get('date'));
    console.log('[DEBUG] Frontend API - All search params:', Object.fromEntries(searchParams.entries()));
    console.log('[DEBUG] Frontend API - Backend URL:', `${API_BASE_URL}/api/work-plans?${params}`);

    const response = await fetch(`${API_BASE_URL}/api/work-plans?${params}`);
    const data = await response.json();

    console.log('[DEBUG] Frontend API - Backend response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching work plans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch work plans' },
      { status: 500 }
    );
  }
} 