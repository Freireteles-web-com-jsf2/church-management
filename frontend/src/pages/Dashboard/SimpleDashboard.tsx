import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/supabase';

const SimpleDashboard: React.FC = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    const handleRefreshSession = async () => {
        try {
            console.log('Forçando atualização da sessão...');
            await authService.refreshSession();
            window.location.reload();
        } catch (error) {
            console.error('Erro ao atualizar sessão:', error);
        }
    };

    const handleForceLogout = async () => {
        try {
            console.log('Forçando logout...');
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const handleClearCache = () => {
        console.log('Limpando cache e recarregando...');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    if (isLoading) {
        return <div>Carregando dashboard...</div>;
    }

    if (!isAuthenticated) {
        return <div>Usuário não autenticado</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Simples</h1>
            <p>Bem-vindo, {user?.name || 'Usuário'}!</p>
            <p>Email: {user?.email}</p>
            <p>Função: {user?.role}</p>
            <p>Status: Autenticado com sucesso!</p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button 
                    onClick={handleRefreshSession}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Atualizar Sessão
                </button>
                <button 
                    onClick={handleForceLogout}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🚪 Forçar Logout
                </button>
                <button 
                    onClick={handleClearCache}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#ffc107', 
                        color: 'black', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🗑️ Limpar Cache
                </button>
            </div>

            <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
                <h3>Informações de Debug:</h3>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
        </div>
    );
};

export default SimpleDashboard;