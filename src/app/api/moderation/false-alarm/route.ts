import { NextRequest, NextResponse } from 'next/server';
import { markAsFalseAlarm } from '../../backend/services/cacheService';

export async function POST(req: NextRequest) {
  try {
    const { contentHash, verifiedBy } = await req.json();

    if (!contentHash || !verifiedBy) {
      return NextResponse.json({ error: 'Content hash and verifier ID are required' }, { status: 400 });
    }

    await markAsFalseAlarm(contentHash, verifiedBy);
    return NextResponse.json({ message: 'Marked as false alarm successfully' });
  } catch (error) {
    console.error('Error marking false alarm:', error);
    return NextResponse.json({ error: 'Failed to mark as false alarm' }, { status: 500 });
  }
}
