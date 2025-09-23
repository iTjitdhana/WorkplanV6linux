import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const BACKEND_URL = process.env.BACKEND_URL || config.api.baseUrl;

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/production-logs/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching latest production data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการผลิตล่าสุด',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
