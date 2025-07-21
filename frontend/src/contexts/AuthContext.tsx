import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';
import type { UserData } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { translateError } from '../utils/errorTranslations';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (newPassword: string) => Promise<void>;
    register: (email: string, password: string, userData: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

// Função para converter o usuário do Supabase para o formato da aplicação
const mapUserData = (supabaseUser: SupabaseUser, userData: UserData): User => {
    return {
        id: supabaseUser.id,
        name: userData.name,
        email: supabaseUser.email || '',
        role: userData.role,
        avatar: userData.avatar_url
    };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar se o usuário está autenticado ao carregar a página
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                console.log('AuthContext: Dados do usuário retornados:', currentUser);

                if (currentUser && currentUser.user) {
                    if (currentUser.userData) {
                        console.log('AuthContext: Usando dados da tabela users:', currentUser.userData);
                        setUser(mapUserData(currentUser.user, currentUser.userData));
                    } else {
                        console.log('AuthContext: Usando dados básicos do auth');
                        // Se não conseguiu buscar dados da tabela users, usar dados básicos do auth
                        setUser({
                            id: currentUser.user.id,
                            name: currentUser.user.user_metadata?.name || currentUser.user.email || 'Usuário',
                            email: currentUser.user.email || '',
                            role: 'membro' // Role padrão
                        });
                    }
                }
            } catch (error: any) {
                // Só logar erro se não for erro de usuário não autenticado
                if (error?.message && !error.message.includes('JWT')) {
                    console.error('Erro ao verificar autenticação:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            console.log('AuthContext: Iniciando processo de login...');
            const { user: supabaseUser, userData } = await authService.login(email, password);

            if (supabaseUser && userData) {
                console.log('AuthContext: Login bem-sucedido, mapeando dados do usuário...');
                const mappedUser = mapUserData(supabaseUser, userData);
                console.log('AuthContext: Usuário mapeado:', mappedUser);
                setUser(mappedUser);
                console.log('AuthContext: Estado do usuário atualizado, autenticação concluída');
            } else {
                console.error('AuthContext: Falha ao obter dados do usuário');
                throw new Error('Falha ao obter dados do usuário');
            }
        } catch (error: any) {
            console.error('AuthContext: Erro ao fazer login:', error);
            throw new Error(translateError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, userData: Partial<UserData>) => {
        setIsLoading(true);
        try {
            await authService.register(email, password, userData);
            // Não faz login automático após o registro
        } catch (error: any) {
            console.error('Erro ao registrar:', error);
            throw new Error(translateError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            await authService.forgotPassword(email);
        } catch (error: any) {
            console.error('Erro ao solicitar recuperação de senha:', error);
            throw new Error(translateError(error));
        }
    };

    const resetPassword = async (newPassword: string) => {
        try {
            await authService.resetPassword(newPassword);
        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error);
            throw new Error(translateError(error));
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        forgotPassword,
        resetPassword,
        register
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;