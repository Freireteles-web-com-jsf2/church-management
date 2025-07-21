import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { localAuthService } from '../services/localAuth';
import type { LocalUser, SessionStatus, SessionInfo, AppState } from '../services/localAuth';

interface LocalAuthContextType {
  user: LocalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<{ valid: boolean; email?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  validatePassword: (password: string) => { valid: boolean; message?: string; errors?: string[] };
  getPasswordStrength: (password: string) => { score: number; level: 'weak' | 'fair' | 'good' | 'strong'; feedback: string[] };
  testUsers: LocalUser[];
  sessionStatus: SessionStatus;
  sessionExpiresAt: Date | null;
  remainingTime: number | null;
  extendSession: () => Promise<void>;
  resetIdleTimer: () => void;
  // New profile and password management methods
  updateProfile: (data: Partial<LocalUser>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  // Enhanced session management
  getSessionInfo: () => SessionInfo | null;
  invalidateSession: () => Promise<void>;
  getActiveSessions: () => SessionInfo[];
  // State persistence methods
  clearAuthState: () => void;
  saveAppState: (appState: Partial<AppState>) => void;
  loadAppState: () => AppState | null;
  isPersistenceEnabled: () => boolean;
  setPersistenceEnabled: (enabled: boolean) => void;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error('useLocalAuth deve ser usado dentro de um LocalAuthProvider');
  }
  return context;
};

interface LocalAuthProviderProps {
  children: React.ReactNode;
}

export const LocalAuthProvider: React.FC<LocalAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('active');
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Referência para o intervalo de verificação de sessão
  const sessionCheckIntervalRef = useRef<number | null>(null);

  // Lista de eventos para monitorar atividade do usuário
  const userActivityEvents = [
    'mousedown', 'mousemove', 'keydown',
    'scroll', 'touchstart', 'click', 'focus'
  ];

  // Função para resetar o timer de inatividade
  const resetIdleTimer = useCallback(() => {
    if (user) {
      localAuthService.updateLastActivity();
      checkSessionStatus();
    }
  }, [user]);

  // Verificar status da sessão
  const checkSessionStatus = useCallback(() => {
    if (!user) return;

    const status = localAuthService.checkSessionStatus();
    const session = localAuthService.getSessionInfo();

    setSessionStatus(status);
    setSessionExpiresAt(session?.expiresAt || null);
    setRemainingTime(localAuthService.getRemainingTime());

    // Se a sessão expirou ou o usuário está inativo, fazer logout
    if (status === 'expired' || status === 'idle') {
      logout();
    }
  }, [user]);

  // Estender a sessão atual
  const extendSession = async () => {
    if (!user) return;

    const session = localAuthService.extendSession();
    if (session) {
      setSessionExpiresAt(session.expiresAt);
      setSessionStatus('active');
      setRemainingTime(localAuthService.getRemainingTime());
    }
  };

  // Configurar monitoramento de atividade do usuário
  useEffect(() => {
    if (user) {
      // Adicionar event listeners para monitorar atividade
      userActivityEvents.forEach(event => {
        window.addEventListener(event, resetIdleTimer);
      });

      // Iniciar verificação periódica da sessão (a cada 30 segundos)
      sessionCheckIntervalRef.current = window.setInterval(() => {
        checkSessionStatus();
      }, 30000);
    } else {
      // Limpar event listeners quando não há usuário
      userActivityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });

      // Limpar intervalos
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    }

    // Cleanup ao desmontar
    return () => {
      userActivityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });

      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [user, resetIdleTimer, checkSessionStatus]);

  // Reidratar estado da aplicação na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Usar o novo método de reidratação de estado
        const { user: rehydratedUser, sessionInfo, isValid } = localAuthService.rehydrateAuthState();

        if (isValid && rehydratedUser && sessionInfo) {
          // Estado válido encontrado, restaurar usuário e sessão
          setUser(rehydratedUser);
          setSessionExpiresAt(sessionInfo.expiresAt);
          setSessionStatus('active');
          setRemainingTime(localAuthService.getRemainingTime());

          // Sincronizar estado para garantir consistência
          localAuthService.syncAuthState();
        } else {
          // Estado inválido ou não encontrado, limpar tudo
          localAuthService.clearAuthState();
          setUser(null);
          setSessionStatus('expired');
          setSessionExpiresAt(null);
          setRemainingTime(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Em caso de erro, limpar estado
        localAuthService.clearAuthState();
        setUser(null);
        setSessionStatus('expired');
        setSessionExpiresAt(null);
        setRemainingTime(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Configurar sincronização entre abas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Sincronizar estado quando houver mudanças em outras abas
      if (event.key && ['church_local_user', 'church_session', 'church_auth_persistence'].includes(event.key)) {
        const { user: syncedUser, sessionInfo, isValid } = localAuthService.rehydrateAuthState();
        
        if (isValid && syncedUser && sessionInfo) {
          // Atualizar estado com dados sincronizados
          setUser(syncedUser);
          setSessionExpiresAt(sessionInfo.expiresAt);
          setSessionStatus('active');
          setRemainingTime(localAuthService.getRemainingTime());
        } else {
          // Limpar estado se não for válido
          setUser(null);
          setSessionStatus('expired');
          setSessionExpiresAt(null);
          setRemainingTime(null);
        }
      }
    };

    // Configurar listener para mudanças no localStorage
    const cleanup = localAuthService.onStorageChange(handleStorageChange);

    // Cleanup ao desmontar
    return cleanup;
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const loggedUser = await localAuthService.login(email, password, rememberMe);
      setUser(loggedUser);

      // Configurar informações da sessão
      const session = localAuthService.getSessionInfo();
      setSessionExpiresAt(session?.expiresAt || null);
      setSessionStatus('active');
      setRemainingTime(localAuthService.getRemainingTime());

      // Salvar estado de autenticação de forma segura
      if (session) {
        localAuthService.saveAuthState(loggedUser, session);
      }

      // Iniciar monitoramento de atividade
      resetIdleTimer();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await localAuthService.logout();
      
      // Usar o novo método de limpeza completa do estado
      localAuthService.clearAuthState();
      
      setUser(null);
      setSessionStatus('expired');
      setSessionExpiresAt(null);
      setRemainingTime(null);

      // Limpar intervalos
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await localAuthService.forgotPassword(email);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateResetToken = async (token: string) => {
    setIsLoading(true);
    try {
      return await localAuthService.validateResetToken(token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await localAuthService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    return localAuthService.validatePassword(password);
  };

  const getPasswordStrength = (password: string) => {
    return localAuthService.getPasswordStrength(password);
  };

  // New profile and password management methods
  const updateProfile = async (data: Partial<LocalUser>) => {
    setIsLoading(true);
    try {
      const updatedUser = await localAuthService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await localAuthService.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    setIsLoading(true);
    try {
      const newSession = await localAuthService.refreshToken();
      setSessionExpiresAt(newSession.expiresAt);
      setRemainingTime(localAuthService.getRemainingTime());
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced session management methods
  const getSessionInfo = () => {
    return localAuthService.getSessionInfo();
  };

  const invalidateSession = async () => {
    setIsLoading(true);
    try {
      await localAuthService.invalidateSession();
      setUser(null);
      setSessionStatus('expired');
      setSessionExpiresAt(null);
      setRemainingTime(null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveSessions = () => {
    return localAuthService.getActiveSessions();
  };

  // State persistence methods
  const clearAuthState = () => {
    localAuthService.clearAuthState();
    setUser(null);
    setSessionStatus('expired');
    setSessionExpiresAt(null);
    setRemainingTime(null);
  };

  const saveAppState = (appState: Partial<AppState>) => {
    localAuthService.saveAppState(appState);
  };

  const loadAppState = () => {
    return localAuthService.loadAppState();
  };

  const isPersistenceEnabled = () => {
    return localAuthService.isPersistenceEnabled();
  };

  const setPersistenceEnabled = (enabled: boolean) => {
    localAuthService.setPersistenceEnabled(enabled);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    forgotPassword,
    validateResetToken,
    resetPassword,
    validatePassword,
    getPasswordStrength,
    testUsers: localAuthService.getTestUsers(),
    sessionStatus,
    sessionExpiresAt,
    remainingTime,
    extendSession,
    resetIdleTimer,
    // New methods
    updateProfile,
    changePassword,
    refreshToken,
    getSessionInfo,
    invalidateSession,
    getActiveSessions,
    // State persistence methods
    clearAuthState,
    saveAppState,
    loadAppState,
    isPersistenceEnabled,
    setPersistenceEnabled
  };

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
};