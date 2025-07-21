import { useState, useEffect, useMemo } from 'react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import type { LocalUser, SessionInfo } from '../services/localAuth';

// Hook para verificação de permissões baseadas em role
export const usePermissions = () => {
  const { user } = useLocalAuth();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canManageUsers: false,
        canManageFinances: false,
        canManageEvents: false,
        canViewReports: false,
        canManageContent: false,
        canAccessAdmin: false,
        role: null
      };
    }

    const rolePermissions = {
      admin: {
        canManageUsers: true,
        canManageFinances: true,
        canManageEvents: true,
        canViewReports: true,
        canManageContent: true,
        canAccessAdmin: true
      },
      pastor: {
        canManageUsers: true,
        canManageFinances: true,
        canManageEvents: true,
        canViewReports: true,
        canManageContent: true,
        canAccessAdmin: false
      },
      lider: {
        canManageUsers: false,
        canManageFinances: false,
        canManageEvents: true,
        canViewReports: true,
        canManageContent: true,
        canAccessAdmin: false
      },
      tesoureiro: {
        canManageUsers: false,
        canManageFinances: true,
        canManageEvents: false,
        canViewReports: true,
        canManageContent: false,
        canAccessAdmin: false
      },
      voluntario: {
        canManageUsers: false,
        canManageFinances: false,
        canManageEvents: false,
        canViewReports: false,
        canManageContent: true,
        canAccessAdmin: false
      },
      membro: {
        canManageUsers: false,
        canManageFinances: false,
        canManageEvents: false,
        canViewReports: false,
        canManageContent: false,
        canAccessAdmin: false
      }
    };

    return {
      ...rolePermissions[user.role],
      role: user.role
    };
  }, [user]);

  // Função para verificar permissão específica
  const hasPermission = (permission: keyof typeof permissions): boolean => {
    return Boolean(permissions[permission]);
  };

  // Função para verificar se tem pelo menos uma das permissões
  const hasAnyPermission = (permissionList: Array<keyof typeof permissions>): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  // Função para verificar se tem todas as permissões
  const hasAllPermissions = (permissionList: Array<keyof typeof permissions>): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };

  // Função para verificar se tem role específica ou superior
  const hasRoleOrHigher = (requiredRole: LocalUser['role']): boolean => {
    if (!user) return false;

    const roleHierarchy: Record<LocalUser['role'], number> = {
      membro: 1,
      voluntario: 2,
      tesoureiro: 3,
      lider: 4,
      pastor: 5,
      admin: 6
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return {
    ...permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRoleOrHigher,
    user
  };
};

// Hook para gerenciamento de sessão
export const useSession = () => {
  const { 
    sessionStatus, 
    sessionExpiresAt, 
    remainingTime, 
    extendSession, 
    refreshToken,
    getSessionInfo,
    invalidateSession,
    getActiveSessions,
    resetIdleTimer
  } = useLocalAuth();

  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');

  // Atualizar tempo restante formatado
  useEffect(() => {
    if (remainingTime) {
      const minutes = Math.floor(remainingTime / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      setTimeUntilExpiry(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setTimeUntilExpiry('');
    }
  }, [remainingTime]);

  // Verificar se a sessão está prestes a expirar
  const isExpiringSoon = sessionStatus === 'expiring_soon';
  const isExpired = sessionStatus === 'expired';
  const isIdle = sessionStatus === 'idle';
  const isActive = sessionStatus === 'active';

  // Obter informações detalhadas da sessão
  const sessionInfo = getSessionInfo();

  // Função para estender sessão com feedback
  const handleExtendSession = async (): Promise<boolean> => {
    try {
      await extendSession();
      return true;
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      return false;
    }
  };

  // Função para atualizar token com feedback
  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      await refreshToken();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      return false;
    }
  };

  // Função para invalidar sessão com feedback
  const handleInvalidateSession = async (): Promise<boolean> => {
    try {
      await invalidateSession();
      return true;
    } catch (error) {
      console.error('Erro ao invalidar sessão:', error);
      return false;
    }
  };

  return {
    sessionStatus,
    sessionExpiresAt,
    remainingTime,
    timeUntilExpiry,
    isExpiringSoon,
    isExpired,
    isIdle,
    isActive,
    sessionInfo,
    activeSessions: getActiveSessions(),
    extendSession: handleExtendSession,
    refreshToken: handleRefreshToken,
    invalidateSession: handleInvalidateSession,
    resetIdleTimer
  };
};

// Interface para atividade de login
interface LoginActivity {
  id: string;
  userId: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  failureReason?: string;
}

// Hook para histórico de login e atividades
export const useLoginHistory = () => {
  const { user } = useLocalAuth();
  const [loginHistory, setLoginHistory] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simular busca do histórico de login
  const fetchLoginHistory = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simular dados de histórico de login
      const mockHistory: LoginActivity[] = [
        {
          id: '1',
          userId: user.id,
          email: user.email,
          success: true,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        },
        {
          id: '2',
          userId: user.id,
          email: user.email,
          success: false,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
          failureReason: 'Senha incorreta'
        },
        {
          id: '3',
          userId: user.id,
          email: user.email,
          success: true,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        }
      ];

      setLoginHistory(mockHistory);
    } catch (error) {
      console.error('Erro ao buscar histórico de login:', error);
      setLoginHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar histórico quando o usuário muda
  useEffect(() => {
    if (user) {
      fetchLoginHistory();
    } else {
      setLoginHistory([]);
    }
  }, [user]);

  // Filtrar apenas logins bem-sucedidos
  const successfulLogins = loginHistory.filter(activity => activity.success);

  // Filtrar apenas tentativas falhadas
  const failedAttempts = loginHistory.filter(activity => !activity.success);

  // Obter último login bem-sucedido
  const lastSuccessfulLogin = successfulLogins[0];

  // Obter estatísticas
  const stats = {
    totalAttempts: loginHistory.length,
    successfulLogins: successfulLogins.length,
    failedAttempts: failedAttempts.length,
    successRate: loginHistory.length > 0 ? (successfulLogins.length / loginHistory.length) * 100 : 0
  };

  // Detectar atividade suspeita (múltiplas tentativas falhadas)
  const suspiciousActivity = failedAttempts.length >= 3;

  // Obter dispositivos únicos
  const uniqueDevices = Array.from(
    new Set(loginHistory.map(activity => activity.userAgent))
  ).length;

  // Obter IPs únicos
  const uniqueIPs = Array.from(
    new Set(loginHistory.map(activity => activity.ipAddress))
  ).length;

  return {
    loginHistory,
    successfulLogins,
    failedAttempts,
    lastSuccessfulLogin,
    stats,
    suspiciousActivity,
    uniqueDevices,
    uniqueIPs,
    isLoading,
    refreshHistory: fetchLoginHistory
  };
};