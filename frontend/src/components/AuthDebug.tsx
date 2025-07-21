import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px'
        }}>
            <h4>Debug de Autenticação</h4>
            <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
            <p><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p><strong>URL atual:</strong> {window.location.pathname}</p>
        </div>
    );
};

export default AuthDebug;