import { createClient } from '@supabase/supabase-js';
import { translateError } from '../utils/errorTranslations';

// Configuração do Supabase
const supabaseUrl = 'https://pskaimoanrxcsjeaalrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza2FpbW9hbnJ4Y3NqZWFhbHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIwMjgsImV4cCI6MjA2ODE4ODAyOH0.yQtaXz0Ss854-X47rAM-kMzCdyWdIFf-VE744U3tcYU';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para os dados do usuário
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';
  avatar_url?: string;
  created_at: string;
}

// Serviço de autenticação
export const authService = {
  // Login com email e senha
  async login(email: string, password: string) {
    console.log('Iniciando processo de login no Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro na autenticação do Supabase:', error);
      throw error;
    }

    console.log('Autenticação bem-sucedida, buscando dados do usuário...');
    // Buscar dados adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    console.log('Dados do usuário obtidos com sucesso:', userData);
    return {
      user: data.user,
      userData
    };
  },

  // Registro de novo usuário
  async register(email: string, password: string, userData: Partial<UserData>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'membro'
        }
      }
    });

    if (error) throw error;

    // Criar registro na tabela de usuários
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: userData.name,
            role: userData.role || 'membro',
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;
    }

    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Recuperação de senha
  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha/recovery`
    });
    if (error) throw error;
  },

  // Redefinição de senha
  async resetPassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  // Verificar sessão atual
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Obter usuário atual
  async getCurrentUser() {
    console.log('getCurrentUser: Iniciando busca do usuário atual...');
    const { data, error } = await supabase.auth.getUser();
    console.log('getCurrentUser: Resultado do auth.getUser():', { data, error });
    if (error) throw error;

    if (!data.user) {
      console.log('getCurrentUser: Nenhum usuário autenticado');
      return null;
    }

    console.log('getCurrentUser: Usuário autenticado encontrado:', data.user.id);
    try {
      // Buscar dados adicionais do usuário
      console.log('getCurrentUser: Buscando dados da tabela users para ID:', data.user.id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('getCurrentUser: Resultado da busca na tabela users:', { userData, userError });

      if (userError) throw userError;

      console.log('getCurrentUser: Dados do usuário obtidos com sucesso:', userData);
      return {
        user: data.user,
        userData
      };
    } catch (userError) {
      console.warn('Erro ao buscar dados do usuário:', userError);
      // Retornar apenas os dados básicos do auth se não conseguir buscar da tabela users
      return {
        user: data.user,
        userData: null
      };
    }
  },

  // Forçar atualização da sessão
  async refreshSession() {
    console.log('refreshSession: Forçando atualização da sessão...');
    const { data, error } = await supabase.auth.refreshSession();
    console.log('refreshSession: Resultado:', { data, error });
    if (error) throw error;
    return data;
  }
};

// Serviço para gerenciar pessoas
export const pessoasService = {
  // Listar todas as pessoas
  async listarPessoas() {
    const { data, error } = await supabase
      .from('pessoas')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data;
  },

  // Buscar pessoa por ID
  async buscarPessoaPorId(id: string) {
    const { data, error } = await supabase
      .from('pessoas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar nova pessoa
  async criarPessoa(pessoa: any) {
    const { data, error } = await supabase
      .from('pessoas')
      .insert([pessoa])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Atualizar pessoa
  async atualizarPessoa(id: string, pessoa: any) {
    const { data, error } = await supabase
      .from('pessoas')
      .update(pessoa)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Excluir pessoa
  async excluirPessoa(id: string) {
    const { error } = await supabase
      .from('pessoas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Upload de foto
  async uploadFoto(file: File, path: string) {
    const { error } = await supabase.storage
      .from('fotos')
      .upload(path, file);

    if (error) throw error;
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('fotos')
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  }
};

export default supabase;