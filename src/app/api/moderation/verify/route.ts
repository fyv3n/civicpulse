import { NextRequest, NextResponse } from 'next/server';
import { verifyEmergency } from '../../backend/services/cacheService';

export async function POST(req: NextRequest) {
  try {
    const { contentHash, verifiedBy } = await req.json();

    if (!contentHash || !verifiedBy) {
      return NextResponse.json({ error: 'Content hash and verifier ID are required' }, { status: 400 });
    }

    await verifyEmergency(contentHash, verifiedBy);
    return NextResponse.json({ message: 'Emergency verified successfully' });
  } catch (error) {
    console.error('Error verifying emergency:', error);
    return NextResponse.json({ error: 'Failed to verify emergency' }, { status: 500 });
  }
}
