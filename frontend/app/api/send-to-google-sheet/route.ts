import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.94:3101';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/send-to-google-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending to Google Sheet:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send to Google Sheet' },
      { status: 500 }
    );
  }
} 