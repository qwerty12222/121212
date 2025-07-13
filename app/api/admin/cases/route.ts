import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server/storage';

export async function GET(request: NextRequest) {
  try {
    const cases = await storage.getAllCases();
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Admin cases error:', error);
    return NextResponse.json(
      { error: 'Failed to get cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const caseData = await request.json();
    const newCase = await storage.createCase(caseData);
    return NextResponse.json(newCase);
  } catch (error) {
    console.error('Admin case creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { caseId, updates } = await request.json();
    
    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    const updatedCase = await storage.updateCase(caseId, updates);
    
    if (!updatedCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error('Admin case update error:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}