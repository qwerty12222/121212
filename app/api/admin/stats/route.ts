import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server/storage';

export async function GET(request: NextRequest) {
  try {
    const stats = await storage.getSystemStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get system stats' },
      { status: 500 }
    );
  }
}