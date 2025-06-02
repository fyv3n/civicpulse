import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token' });
  }

  try {
    // Verify the Firebase token
    const decodedToken = await adminAuth?.verifyIdToken(token);
    const uid = decodedToken?.uid;

    if (!uid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user data from Firestore
    const userDoc = await adminDb?.collection('users').doc(uid).get();
    const user = userDoc?.data();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err: Error | unknown) {
    console.error('Verify token error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
