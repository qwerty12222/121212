import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server/storage';

export async function GET(request: NextRequest) {
  try {
    const users = await storage.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await storage.updateUser(userId, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}