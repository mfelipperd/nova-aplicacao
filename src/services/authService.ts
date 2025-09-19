import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import type {
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configurar escopo do Google
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const authService = {
  // Login com email e senha
  async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // Registro com email e senha
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Atualizar o nome do usuário
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // Login com Google
  async loginWithGoogle(): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await signInWithPopup(
        auth,
        googleProvider
      );
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // Login com Facebook
  async loginWithFacebook(): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await signInWithPopup(
        auth,
        facebookProvider
      );
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // Mapear usuário do Firebase para nosso formato
  mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  },

  // Tratar erros de autenticação
  handleAuthError(error: any): Error {
    console.error('Auth error:', error);
    
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('Usuário não encontrado.');
      case 'auth/wrong-password':
        return new Error('Senha incorreta.');
      case 'auth/email-already-in-use':
        return new Error('Este email já está em uso.');
      case 'auth/weak-password':
        return new Error('A senha deve ter pelo menos 6 caracteres.');
      case 'auth/invalid-email':
        return new Error('Email inválido.');
      case 'auth/too-many-requests':
        return new Error('Muitas tentativas. Tente novamente mais tarde.');
      case 'auth/popup-closed-by-user':
        return new Error('Login cancelado pelo usuário.');
      case 'auth/popup-blocked':
        return new Error('Popup bloqueado pelo navegador.');
      default:
        return new Error('Erro de autenticação. Tente novamente.');
    }
  }
};
