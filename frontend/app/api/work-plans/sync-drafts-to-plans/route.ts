import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const API_BASE_URL = process.env.BACKEND_URL || config.api.baseUrl;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/work-plans/sync-drafts-to-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error syncing drafts to plans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync drafts to plans' },
      { status: 500 }
    );
  }
} 
