// Export components
export { default as RoleGuard } from './components/role-guard';
export { AuthProvider, useAuth } from './context/auth-context';

// Export types
export * from './types';

// Export utilities
export { verifyToken } from './utils/verifyToken';

// Re-export firebase auth functions we commonly use
export {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail
} from 'firebase/auth'; 