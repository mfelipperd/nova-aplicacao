import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const LoginForm: React.FC = () => {
  const [error, setError] = useState('');
  
  const { user, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar automaticamente quando o usuário fizer login
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
    } catch (err) {
      setError('Erro ao fazer login com Google. Tente novamente.');
      console.error('Erro no login com Google:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg mb-8">
            <span className="text-white font-bold text-3xl">📸</span>
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-4">
            EventPhotos
          </h2>
          <p className="text-xl text-white text-opacity-80 mb-8">
            Entre na festa e compartilhe suas fotos!
          </p>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white border-opacity-20">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-6">
              Faça login para continuar
            </h3>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
                  Entrando...
                </div>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Entrar com Google
                </>
              )}
            </button>
            
            <p className="mt-6 text-sm text-white text-opacity-60">
              Ao fazer login, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
