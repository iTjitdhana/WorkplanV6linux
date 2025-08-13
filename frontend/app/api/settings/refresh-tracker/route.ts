import { NextRequest, NextResponse } from 'next/server';

// Global variable to store refresh signal (works in development)
// In production, this might not work across multiple instances
let refreshSignal = {
  timestamp: 0,
  shouldRefresh: false
};

export async function POST(request: NextRequest) {
  try {
    // Set refresh signal with current timestamp
    refreshSignal = {
      timestamp: Date.now(),
      shouldRefresh: true
    };

    console.log('[DEBUG] Refresh signal set:', refreshSignal);

    return NextResponse.json({
      success: true,
      message: 'Refresh signal sent successfully',
      timestamp: refreshSignal.timestamp
    });
  } catch (error) {
    console.error('Error sending refresh signal:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send refresh signal'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = Date.now();
    const timeDiff = now - refreshSignal.timestamp;
    
    // Check if signal is recent (within 10 seconds) and should refresh
    if (timeDiff < 10000 && refreshSignal.shouldRefresh) {
      // Reset signal after reading
      refreshSignal.shouldRefresh = false;
      
      console.log('[DEBUG] Refresh signal detected, returning true');
      
      return NextResponse.json({
        success: true,
        shouldRefresh: true,
        timestamp: refreshSignal.timestamp
      });
    }

    return NextResponse.json({
      success: true,
      shouldRefresh: false,
      timestamp: refreshSignal.timestamp
    });
  } catch (error) {
    console.error('Error checking refresh signal:', error);
    return NextResponse.json({
      success: false,
      shouldRefresh: false
    }, { status: 500 });
  }
}
