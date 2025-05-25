import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify the Firebase token
    const decodedToken = await adminAuth?.verifyIdToken(token);
    const uid = decodedToken?.uid;

    if (!uid) {
      return NextResponse.json(
        { error: 'Invalid token - No user ID' },
        { status: 401 }
      );
    }

    // Fetch user data from Firestore
    const userDoc = await adminDb?.collection('users').doc(uid).get();
    const user = userDoc?.data();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without sensitive information
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (err: any) {
    console.error('Token verification error:', err);
    return NextResponse.json(
      { error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }
}
