import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Logar erro para debug
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 32, textAlign: 'center', color: '#b71c1c' }}>
          <h2>Ocorreu um erro inesperado.</h2>
          <p>Tente recarregar a página ou clique abaixo para tentar novamente.</p>
          <button onClick={this.handleRetry} style={{ marginTop: 16 }}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
} 