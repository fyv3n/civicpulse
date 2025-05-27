import { cookies } from 'next/headers'; // only works in app router
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    
    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin services not initialized');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Firebase Admin services not initialized'
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    const authHeader = req.headers.get('authorization');    
    const token = authHeader?.split('Bearer ')[1];


    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'No token' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const uid = decodedToken?.uid;
      const userDoc = await adminDb.collection('users').doc(uid).get();
      const user = userDoc?.data();

      if (!user) {
        return new NextResponse(
          JSON.stringify({ error: 'User not found' }),
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Create a session cookie value with just the data you need
      const sessionData = JSON.stringify({
        uid,
        role: user.role,
      });
      (await cookies()).set('__session', sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return new NextResponse(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (verifyError: unknown) {
      console.error('Token verification error:', verifyError);
      
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Unknown error';
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Token verification failed',
          details: errorMessage
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error: unknown) {
    console.error('Verify error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Verification failed',
        details: errorMessage
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
