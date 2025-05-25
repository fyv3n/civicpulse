import { auth } from '@/lib/firebase/config';

export async function verifyToken() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    const token = await user.getIdToken();
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
} 