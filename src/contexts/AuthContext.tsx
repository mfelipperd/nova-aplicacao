import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuário logado
        const mappedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined,
          provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' :
                   firebaseUser.providerData[0]?.providerId === 'facebook.com' ? 'facebook' : 'local'
        };
        setUser(mappedUser);
      } else {
        // Usuário não logado
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.loginWithEmail(email, password);
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await authService.loginWithGoogle();
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    setLoading(true);
    try {
      await authService.loginWithFacebook();
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await authService.registerWithEmail(email, password, name);
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
