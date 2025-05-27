import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let _adminAuth: ReturnType<typeof getAuth> | null = null;
let _adminDb: ReturnType<typeof getFirestore> | null = null;

function getFirebaseAdmin() {
  if (_adminAuth && _adminDb) {
    return { adminAuth: _adminAuth, adminDb: _adminDb };
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set');
    }

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
    }

    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('FIREBASE_CLIENT_EMAIL is not set');
    }


    // Fix: Only initialize if not already initialized
    const apps = getApps();
    const app = apps.length === 0
      ? initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
          })
        })
      : apps[0];

    // Initialize services
    _adminAuth = getAuth(app);
    _adminDb = getFirestore(app);
    
    return { adminAuth: _adminAuth, adminDb: _adminDb };
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
}

const { adminAuth, adminDb } = getFirebaseAdmin();
export { adminAuth, adminDb };
