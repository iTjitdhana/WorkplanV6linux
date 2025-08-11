import { NextRequest, NextResponse } from 'next/server';

// Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📡 [Frontend API] Sending to Google Sheet:', body);
    
    // เรียกไปที่ Google Apps Script โดยตรง
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    console.log('📡 [Frontend API] Google Script response status:', response.status);
    
    if (!response.ok) {
      console.error('📡 [Frontend API] Google Script error status:', response.status);
      throw new Error(`Google Script error: ${response.status}`);
    }
    
    const result = await response.text();
    console.log('📡 [Frontend API] Google Script response:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data sent to Google Sheet successfully',
      result: result 
    });
  } catch (error) {
    console.error('📡 [Frontend API] Error sending to Google Sheet:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send to Google Sheet',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 