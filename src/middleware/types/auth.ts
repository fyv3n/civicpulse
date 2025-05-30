export type UserRole = 'admin' | 'moderator' | 'user';

export interface SessionUser {
  role: UserRole;
  uid: string;
  email: string;
}

export type AuthRedirectPath = '/login' | '/feed'; 