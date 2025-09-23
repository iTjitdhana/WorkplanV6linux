import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { createErrorResponse, createInternalServerErrorResponse } from '@/lib/api';

const BACKEND_URL = process.env.BACKEND_URL || config.api.baseUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workPlanId: string }> }
) {
  try {
    const { workPlanId } = await params;

    const response = await fetch(`${BACKEND_URL}/api/logs/work-plan/${workPlanId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorResponse = createErrorResponse(
        `Backend responded with status: ${response.status}`,
        null,
        response.status
      );
      return NextResponse.json(errorResponse, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    const errorResponse = createInternalServerErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
