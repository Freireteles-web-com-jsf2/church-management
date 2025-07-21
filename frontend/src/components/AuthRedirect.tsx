import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthRedirect: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar um indicador de carregamento enquanto verifica a autenticação
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Carregando...</div>
            </div>
        );
    }

    // Redirecionar para o dashboard se estiver autenticado, ou para a página inicial se não estiver
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

export default AuthRedirect;