import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://192.168.0.94:3102';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productionDate = searchParams.get('productionDate');

    if (!productionDate) {
      return NextResponse.json({ error: 'Production Date is required' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/api/logs/daily-summary?productionDate=${productionDate}`, {
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
    console.error('Error fetching daily summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Daily Summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
