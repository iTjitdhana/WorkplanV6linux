import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporary: disable route guards to simplify UX; rely on backend for authorization
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: [] };
