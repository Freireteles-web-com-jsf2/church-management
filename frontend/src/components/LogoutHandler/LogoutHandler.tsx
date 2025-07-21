import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

interface LogoutHandlerProps {
  children: React.ReactNode;
  redirectTo?: string;
  clearLocalStorage?: boolean;
  clearSessionStorage?: boolean;
  onLogout?: () => void;
  onLogoutComplete?: () => void;
}

const LogoutHandler: React.FC<LogoutHandlerProps> = ({
  children,
  redirectTo = '/local-login',
  clearLocalStorage = true,
  clearSessionStorage = true,
  onLogout,
  onLogoutComplete
}) => {
  const { isAuthenticated, user } = useLocalAuth();
  const navigate = useNavigate();

  // Função para limpar dados adicionais após logout
  const performCleanup = () => {
    if (clearLocalStorage) {
      // Limpar dados específicos do localStorage (mantendo configurações importantes)
      const keysToRemove = [
        'church_local_user',
        'church_session',
        'church_auth_persistence',
        'church_app_state'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }

    if (clearSessionStorage) {
      // Limpar sessionStorage
      sessionStorage.clear();
    }

    // Limpar cookies relacionados à autenticação (se houver)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      if (name.trim().startsWith('church_') || name.trim().startsWith('auth_')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  };

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    // Se o usuário estava autenticado e agora não está mais (logout)
    if (!isAuthenticated && !user) {
      if (onLogout) {
        onLogout();
      }

      // Realizar limpeza
      performCleanup();

      // Redirecionar para a página de login
      navigate(redirectTo, { replace: true });

      if (onLogoutComplete) {
        onLogoutComplete();
      }
    }
  }, [isAuthenticated, user, navigate, redirectTo, onLogout, onLogoutComplete]);

  // Função para logout manual com limpeza
  const handleManualLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      }

      // Realizar limpeza antes do logout
      performCleanup();

      // Redirecionar
      navigate(redirectTo, { replace: true });

      if (onLogoutComplete) {
        onLogoutComplete();
      }
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  };

  // Adicionar listener para eventos de logout de outras abas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Se a chave do usuário foi removida em outra aba, fazer logout aqui também
      if (event.key === 'church_local_user' && event.newValue === null) {
        handleManualLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Adicionar listener para eventos de beforeunload (fechar aba/navegador)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Aqui você pode adicionar lógica para salvar estado antes de fechar
      // Por exemplo, salvar dados temporários ou fazer logout se necessário
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
};

export default LogoutHandler;