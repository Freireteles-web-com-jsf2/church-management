// Serviço de autenticação local para desenvolvimento/testes
import { ErrorHandler } from '../utils/errorHandler';
import { RetryMechanism, RetryConfigs } from '../utils/retryMechanism';
import { AuthErrorType } from '../types/errors';

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';
  avatar?: string;
}

export type SessionStatus = 'active' | 'expiring_soon' | 'expired' | 'idle';

export interface SessionInfo {
  token: string;
  expiresAt: Date;
  lastActivity: Date;
  rememberMe: boolean;
}

export interface AuthPersistenceState {
  user: LocalUser | null;
  sessionInfo: SessionInfo | null;
  lastSyncTime: Date;
  persistenceEnabled: boolean;
}

export interface AppState {
  theme: 'light' | 'dark';
  language: string;
  lastRoute: string;
  preferences: Record<string, any>;
}

// Usuários de teste baseados nos perfis do seed
const testUsers: LocalUser[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@igreja.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Pastor João',
    email: 'pastor@igreja.com',
    role: 'pastor'
  },
  {
    id: '3',
    name: 'Líder Maria',
    email: 'lider@igreja.com',
    role: 'lider'
  },
  {
    id: '4',
    name: 'Tesoureiro Carlos',
    email: 'tesoureiro@igreja.com',
    role: 'tesoureiro'
  },
  {
    id: '5',
    name: 'Voluntário Ana',
    email: 'voluntario@igreja.com',
    role: 'voluntario'
  },
  {
    id: '6',
    name: 'Membro Pedro',
    email: 'membro@igreja.com',
    role: 'membro'
  }
];

// Chaves para armazenar no localStorage
const LOCAL_STORAGE_KEY = 'church_local_user';
const RESET_TOKEN_KEY = 'church_reset_token';
const SESSION_KEY = 'church_session';
const PERSISTENCE_KEY = 'church_auth_persistence';
const APP_STATE_KEY = 'church_app_state';

// Configurações de sessão
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
const EXTENDED_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dias em milissegundos
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutos em milissegundos
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutos antes da expiração

export const localAuthService = {
  // Login local with enhanced error handling
  async login(email: string, password: string, rememberMe: boolean = false): Promise<LocalUser> {
    const correlationId = ErrorHandler.generateCorrelationId();
    
    try {
      // Use retry mechanism for login operation
      return await RetryMechanism.withRetry(async () => {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        // Validation
        if (!email?.trim()) {
          const error = ErrorHandler.createAuthError(
            'Email é obrigatório',
            { component: 'localAuthService', action: 'login' },
            correlationId
          );
          error.type = AuthErrorType.VALIDATION_ERROR;
          throw error;
        }

        if (!password?.trim()) {
          const error = ErrorHandler.createAuthError(
            'Senha é obrigatória',
            { component: 'localAuthService', action: 'login' },
            correlationId
          );
          error.type = AuthErrorType.VALIDATION_ERROR;
          throw error;
        }

        const user = testUsers.find(u => u.email === email);

        if (!user) {
          const error = ErrorHandler.createAuthError(
            'Credenciais inválidas',
            { component: 'localAuthService', action: 'login', additionalData: { email } },
            correlationId
          );
          error.type = AuthErrorType.INVALID_CREDENTIALS;
          throw error;
        }

        // Simulate random network failures for testing (5% chance)
        if (Math.random() < 0.05) {
          const networkError = ErrorHandler.createNetworkError(
            'Falha temporária na conexão',
            undefined,
            undefined,
            { component: 'localAuthService', action: 'login' }
          );
          throw networkError;
        }

        // Salvar no localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
        
        // Criar sessão
        this.createSession(rememberMe);

        return user;
      }, RetryConfigs.auth);
    } catch (error) {
      const authError = ErrorHandler.createAuthError(
        error,
        { component: 'localAuthService', action: 'login', additionalData: { email } },
        correlationId
      );
      ErrorHandler.logError(authError);
      throw authError;
    }
  },

  // Logout local
  async logout(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  },
  
  // Criar uma nova sessão
  createSession(rememberMe: boolean = false): SessionInfo {
    const duration = rememberMe ? EXTENDED_SESSION_DURATION : SESSION_DURATION;
    const expiresAt = new Date(Date.now() + duration);
    
    const sessionInfo: SessionInfo = {
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      expiresAt,
      lastActivity: new Date(),
      rememberMe
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
    return sessionInfo;
  },
  
  // Obter informações da sessão atual
  getSessionInfo(): SessionInfo | null {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    try {
      const session = JSON.parse(sessionData);
      // Converter strings de data para objetos Date
      return {
        ...session,
        expiresAt: new Date(session.expiresAt),
        lastActivity: new Date(session.lastActivity)
      };
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },
  
  // Verificar status da sessão
  checkSessionStatus(): SessionStatus {
    const session = this.getSessionInfo();
    if (!session) {
      return 'expired';
    }
    
    const now = new Date();
    
    // Verificar se a sessão expirou
    if (now >= session.expiresAt) {
      return 'expired';
    }
    
    // Verificar se o usuário está inativo
    const idleTime = now.getTime() - session.lastActivity.getTime();
    if (idleTime >= IDLE_TIMEOUT) {
      return 'idle';
    }
    
    // Verificar se a sessão está prestes a expirar
    const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
    if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY) {
      return 'expiring_soon';
    }
    
    return 'active';
  },
  
  // Atualizar timestamp de última atividade
  updateLastActivity(): void {
    const session = this.getSessionInfo();
    if (session) {
      session.lastActivity = new Date();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  },
  
  // Estender a sessão atual
  extendSession(): SessionInfo | null {
    const session = this.getSessionInfo();
    if (!session) {
      return null;
    }
    
    const duration = session.rememberMe ? EXTENDED_SESSION_DURATION : SESSION_DURATION;
    session.expiresAt = new Date(Date.now() + duration);
    session.lastActivity = new Date();
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  
  // Calcular tempo restante da sessão em milissegundos
  getRemainingTime(): number | null {
    const session = this.getSessionInfo();
    if (!session) {
      return null;
    }
    
    const now = new Date();
    return Math.max(0, session.expiresAt.getTime() - now.getTime());
  },

  // Verificar usuário atual
  getCurrentUser(): LocalUser | null {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    return null;
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  // Listar usuários de teste disponíveis
  getTestUsers(): LocalUser[] {
    return testUsers;
  },

  // Solicitar recuperação de senha with enhanced error handling
  async forgotPassword(email: string): Promise<void> {
    const correlationId = ErrorHandler.generateCorrelationId();
    
    try {
      return await RetryMechanism.withRetry(async () => {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        // Validation
        if (!email?.trim()) {
          const error = ErrorHandler.createValidationError(
            'Email é obrigatório',
            'email',
            ['Email é obrigatório'],
            { component: 'localAuthService', action: 'forgotPassword' }
          );
          throw error;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          const error = ErrorHandler.createValidationError(
            'Formato de email inválido',
            'email',
            ['Formato de email inválido'],
            { component: 'localAuthService', action: 'forgotPassword' }
          );
          error.type = AuthErrorType.INVALID_EMAIL;
          throw error;
        }

        // Simulate random network failures for testing (3% chance)
        if (Math.random() < 0.03) {
          const networkError = ErrorHandler.createNetworkError(
            'Falha temporária no serviço de email',
            503,
            5000,
            { component: 'localAuthService', action: 'forgotPassword' }
          );
          throw networkError;
        }

        // Verificar se o email existe
        const user = testUsers.find(u => u.email === email);

        if (!user) {
          // Não revelar se o email existe ou não por segurança
          // Apenas simular o envio
          return;
        }

        // Gerar token de recuperação (simulado)
        const token = Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        // Em um ambiente real, este token seria armazenado no banco de dados
        // Para o ambiente de desenvolvimento, vamos armazenar no localStorage
        localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify({
          email: user.email,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        }));

        // Em um ambiente real, aqui seria enviado um email
        console.log(`[DEV] Token de recuperação para ${email}: ${token}`);

        return;
      }, RetryConfigs.api);
    } catch (error) {
      const authError = ErrorHandler.createAuthError(
        error,
        { component: 'localAuthService', action: 'forgotPassword', additionalData: { email } },
        correlationId
      );
      ErrorHandler.logError(authError);
      throw authError;
    }
  },

  // Validar token de recuperação
  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Recuperar token do localStorage
    const resetData = localStorage.getItem(RESET_TOKEN_KEY);

    if (!resetData) {
      return { valid: false };
    }

    try {
      const { token: storedToken, email, expiresAt } = JSON.parse(resetData);

      // Verificar se o token é válido e não expirou
      if (token === storedToken && new Date(expiresAt) > new Date()) {
        return { valid: true, email };
      }

      return { valid: false };
    } catch {
      return { valid: false };
    }
  },

  // Redefinir senha
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validar token
    const { valid, email } = await this.validateResetToken(token);

    if (!valid || !email) {
      throw new Error('Token inválido ou expirado');
    }

    // Validar a nova senha
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || 'Senha inválida');
    }

    // Em um ambiente real, aqui seria atualizada a senha no banco de dados
    console.log(`[DEV] Senha redefinida para ${email}: ${newPassword.substring(0, 3)}***`);

    // Remover token usado
    localStorage.removeItem(RESET_TOKEN_KEY);

    return;
  },

  // Validar força da senha
  validatePassword(password: string): { valid: boolean; message?: string; errors?: string[] } {
    const errors: string[] = [];

    // Basic length requirement
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }

    // Maximum length to prevent DoS attacks
    if (password.length > 128) {
      errors.push('A senha não pode ter mais de 128 caracteres');
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra');
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    // Must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }

    // Must contain both uppercase and lowercase letters for stronger passwords
    if (password.length >= 12) {
      if (!/[a-z]/.test(password)) {
        errors.push('Senhas com 12+ caracteres devem conter pelo menos uma letra minúscula');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Senhas com 12+ caracteres devem conter pelo menos uma letra maiúscula');
      }
    }

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/,  // Three or more consecutive identical characters
      /123456|654321|abcdef|qwerty/i,  // Common sequences
      /password|senha|admin|user|login/i,  // Common words
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('A senha contém padrões comuns que a tornam vulnerável');
        break;
      }
    }

    // Check for whitespace at beginning or end
    if (password !== password.trim()) {
      errors.push('A senha não pode começar ou terminar com espaços');
    }

    const isValid = errors.length === 0;
    return {
      valid: isValid,
      message: isValid ? undefined : errors[0], // Return first error for backward compatibility
      errors
    };
  },

  // Get password strength score (0-100)
  getPasswordStrength(password: string): { score: number; level: 'weak' | 'fair' | 'good' | 'strong'; feedback: string[] } {
    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Bonus for multiple character types
    const charTypes = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length;

    if (charTypes >= 3) score += 10;
    if (charTypes === 4) score += 5;

    // Penalties for weak patterns
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123456|654321|abcdef|qwerty/i.test(password)) score -= 15;
    if (/password|senha|admin|user|login/i.test(password)) score -= 20;

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine level and feedback
    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) {
      level = 'weak';
      feedback.push('Senha muito fraca - adicione mais caracteres e variedade');
    } else if (score < 60) {
      level = 'fair';
      feedback.push('Senha razoável - considere adicionar mais caracteres especiais');
    } else if (score < 80) {
      level = 'good';
      feedback.push('Boa senha - bem protegida contra ataques comuns');
    } else {
      level = 'strong';
      feedback.push('Senha muito forte - excelente proteção');
    }

    return { score, level, feedback };
  },

  // Atualizar perfil do usuário
  async updateProfile(data: Partial<LocalUser>): Promise<LocalUser> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não está autenticado');
    }

    // Validar dados de entrada
    if (data.email && data.email !== currentUser.email) {
      // Verificar se o novo email já existe
      const existingUser = testUsers.find(u => u.email === data.email && u.id !== currentUser.id);
      if (existingUser) {
        throw new Error('Este email já está em uso');
      }
    }

    // Atualizar dados do usuário
    const updatedUser: LocalUser = {
      ...currentUser,
      ...data,
      id: currentUser.id // Não permitir alteração do ID
    };

    // Salvar no localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));

    // Atualizar também na lista de usuários de teste (simulação)
    const userIndex = testUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      testUsers[userIndex] = updatedUser;
    }

    return updatedUser;
  },

  // Alterar senha do usuário
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não está autenticado');
    }

    // Em um ambiente real, verificaríamos a senha atual
    // Para desenvolvimento, vamos simular a verificação
    if (!currentPassword.trim()) {
      throw new Error('Senha atual é obrigatória');
    }

    // Validar a nova senha
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || 'Nova senha inválida');
    }

    // Em um ambiente real, aqui seria atualizada a senha no banco de dados
    console.log(`[DEV] Senha alterada para usuário ${currentUser.email}`);

    return;
  },

  // Atualizar token de sessão
  async refreshToken(): Promise<SessionInfo> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));

    const session = this.getSessionInfo();
    if (!session) {
      throw new Error('Nenhuma sessão ativa encontrada');
    }

    // Verificar se a sessão ainda é válida
    const status = this.checkSessionStatus();
    if (status === 'expired') {
      throw new Error('Sessão expirada');
    }

    // Gerar novo token mantendo as outras informações
    const newSession: SessionInfo = {
      ...session,
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      lastActivity: new Date()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  },

  // Invalidar sessão atual
  async invalidateSession(): Promise<void> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    localStorage.removeItem(SESSION_KEY);
  },

  // Obter todas as sessões ativas (simulação - em ambiente real seria do servidor)
  getActiveSessions(): SessionInfo[] {
    const session = this.getSessionInfo();
    return session ? [session] : [];
  },

  // === MÉTODOS DE PERSISTÊNCIA DE ESTADO ===

  // Salvar estado de autenticação de forma segura
  saveAuthState(user: LocalUser | null, sessionInfo: SessionInfo | null): void {
    try {
      const persistenceState: AuthPersistenceState = {
        user,
        sessionInfo,
        lastSyncTime: new Date(),
        persistenceEnabled: true
      };

      // Criptografar dados sensíveis (simulação - em produção usar criptografia real)
      const encryptedState = btoa(JSON.stringify(persistenceState));
      localStorage.setItem(PERSISTENCE_KEY, encryptedState);

      // Salvar também os dados individuais para compatibilidade
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      if (sessionInfo) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (error) {
      console.error('Erro ao salvar estado de autenticação:', error);
    }
  },

  // Recuperar estado de autenticação
  loadAuthState(): AuthPersistenceState | null {
    try {
      const encryptedState = localStorage.getItem(PERSISTENCE_KEY);
      if (!encryptedState) {
        return null;
      }

      // Descriptografar dados (simulação)
      const decryptedState = atob(encryptedState);
      const persistenceState: AuthPersistenceState = JSON.parse(decryptedState);

      // Converter strings de data para objetos Date
      if (persistenceState.sessionInfo) {
        persistenceState.sessionInfo.expiresAt = new Date(persistenceState.sessionInfo.expiresAt);
        persistenceState.sessionInfo.lastActivity = new Date(persistenceState.sessionInfo.lastActivity);
      }
      persistenceState.lastSyncTime = new Date(persistenceState.lastSyncTime);

      return persistenceState;
    } catch (error) {
      console.error('Erro ao carregar estado de autenticação:', error);
      // Limpar dados corrompidos
      localStorage.removeItem(PERSISTENCE_KEY);
      return null;
    }
  },

  // Reidratar estado da aplicação na inicialização
  rehydrateAuthState(): { user: LocalUser | null; sessionInfo: SessionInfo | null; isValid: boolean } {
    const persistedState = this.loadAuthState();
    
    if (!persistedState) {
      return { user: null, sessionInfo: null, isValid: false };
    }

    const { user, sessionInfo } = persistedState;

    // Verificar se o estado ainda é válido
    if (sessionInfo) {
      const now = new Date();
      
      // Verificar se a sessão expirou
      if (now >= sessionInfo.expiresAt) {
        this.clearAuthState();
        return { user: null, sessionInfo: null, isValid: false };
      }

      // Verificar se o usuário ficou inativo por muito tempo
      const idleTime = now.getTime() - sessionInfo.lastActivity.getTime();
      if (idleTime >= IDLE_TIMEOUT && !sessionInfo.rememberMe) {
        this.clearAuthState();
        return { user: null, sessionInfo: null, isValid: false };
      }
    }

    // Se chegou até aqui, o estado é válido
    return { user, sessionInfo, isValid: true };
  },

  // Limpar completamente o estado de autenticação
  clearAuthState(): void {
    try {
      // Remover todos os dados relacionados à autenticação
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PERSISTENCE_KEY);
      localStorage.removeItem(RESET_TOKEN_KEY);
      
      // Limpar também dados de aplicação se necessário
      this.clearAppState();
    } catch (error) {
      console.error('Erro ao limpar estado de autenticação:', error);
    }
  },

  // Salvar estado da aplicação
  saveAppState(appState: Partial<AppState>): void {
    try {
      const currentState = this.loadAppState();
      const newState: AppState = {
        theme: 'light',
        language: 'pt-BR',
        lastRoute: '/',
        preferences: {},
        ...currentState,
        ...appState
      };

      localStorage.setItem(APP_STATE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Erro ao salvar estado da aplicação:', error);
    }
  },

  // Carregar estado da aplicação
  loadAppState(): AppState | null {
    try {
      const stateData = localStorage.getItem(APP_STATE_KEY);
      if (!stateData) {
        return null;
      }

      return JSON.parse(stateData);
    } catch (error) {
      console.error('Erro ao carregar estado da aplicação:', error);
      localStorage.removeItem(APP_STATE_KEY);
      return null;
    }
  },

  // Limpar estado da aplicação
  clearAppState(): void {
    try {
      localStorage.removeItem(APP_STATE_KEY);
    } catch (error) {
      console.error('Erro ao limpar estado da aplicação:', error);
    }
  },

  // Verificar se a persistência está habilitada
  isPersistenceEnabled(): boolean {
    const state = this.loadAuthState();
    return state?.persistenceEnabled ?? true;
  },

  // Habilitar/desabilitar persistência
  setPersistenceEnabled(enabled: boolean): void {
    const currentState = this.loadAuthState();
    if (currentState) {
      currentState.persistenceEnabled = enabled;
      this.saveAuthState(currentState.user, currentState.sessionInfo);
    }
  },

  // Sincronizar estado (útil para múltiplas abas)
  syncAuthState(): void {
    const currentUser = this.getCurrentUser();
    const currentSession = this.getSessionInfo();
    
    if (currentUser || currentSession) {
      this.saveAuthState(currentUser, currentSession);
    }
  },

  // Detectar mudanças no localStorage (para sincronização entre abas)
  onStorageChange(callback: (event: StorageEvent) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === PERSISTENCE_KEY || 
          event.key === LOCAL_STORAGE_KEY || 
          event.key === SESSION_KEY) {
        callback(event);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Retornar função de cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
};