import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server/storage';

export async function GET(request: NextRequest) {
  try {
    const transactions = await storage.getAllTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Admin transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}