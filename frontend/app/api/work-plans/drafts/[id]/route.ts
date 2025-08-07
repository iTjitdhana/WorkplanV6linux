import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/work-plans/drafts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating work plan draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update work plan draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/work-plans/drafts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting work plan draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete work plan draft' },
      { status: 500 }
    );
  }
} 