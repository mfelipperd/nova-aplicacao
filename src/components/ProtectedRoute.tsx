import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Timeout para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - showing login');
        setHasError(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout);
  }, [loading]);

  // Se houve erro ou timeout, redirecionar para login
  if (hasError) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
