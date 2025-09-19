import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
          <div className="text-center text-white p-8 max-w-md">
            <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado</h1>
            <p className="text-white text-opacity-80 mb-6">
              A aplicação encontrou um erro inesperado. Tente recarregar a página.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-white text-red-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-red-900 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm opacity-75">Detalhes do erro</summary>
                <pre className="mt-2 text-xs bg-black bg-opacity-50 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
