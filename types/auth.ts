import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResult<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SignUpData {
  user: User | null;
  session: Session | null;
}

export interface SignInData {
  user: User | null;
  session: Session | null;
}

export interface ResetPasswordData {
  message: string;
}

export interface UpdatePasswordData {
  user: User | null;
} 