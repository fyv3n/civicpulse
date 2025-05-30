import { auth } from '@/lib/firebase/config';

export async function verifyToken() {
  try {
    const user = auth.currentUser;
    
    if (!user) throw new Error('No user logged in');
    const token = await user.getIdToken();
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Try to parse the response as JSON
    let errorData;
    try {
      errorData = await response.json();
    } catch {  // Removed the unused parameter entirely
      throw new Error('Failed to parse server response');
    }

    if (!response.ok) {
      throw new Error(errorData.details || errorData.error || 'Token verification failed');
    }
    
    return errorData;
  } catch (error) {
    throw error;
  }
} 