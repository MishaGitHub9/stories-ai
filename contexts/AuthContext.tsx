import React, { createContext, ReactNode, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthState } from '../types/auth';
import { UserProfile } from '../types/profile';

interface AuthContextType extends AuthState {
  sendMagicLink: (email: string) => Promise<{ data: any; error: any }>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  signUpWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (password: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 