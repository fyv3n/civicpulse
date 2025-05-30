import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export type UserRole = 'admin' | 'moderator' | 'user';

export interface SessionUser {
  uid: string;
  role: UserRole;
  email: string;
} 