import type { LocalUser } from './localAuth';

export interface CreateUserData {
  nome: string;
  email: string;
  password: string;
  funcao: UserRole;
  dataNascimento: string;
  genero: string;
  estadoCivil: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  grupoId?: string;
  fotoUrl?: string;
  dataIngresso: string;
  batizado: boolean;
  camposPersonalizados?: any;
}

export interface UpdateUserData {
  nome?: string;
  email?: string;
  funcao?: UserRole;
  dataNascimento?: string;
  genero?: string;
  estadoCivil?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  grupoId?: string;
  fotoUrl?: string;
  dataIngresso?: string;
  batizado?: boolean;
  camposPersonalizados?: any;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  funcao?: UserRole | UserRole[];
  isActive?: boolean;
  grupoId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

export interface UserWithDetails extends LocalUser {
  dataNascimento?: Date;
  genero?: string;
  estadoCivil?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  grupoId?: string;
  fotoUrl?: string;
  dataIngresso?: Date;
  batizado?: boolean;
  camposPersonalizados?: any;
  isActive: boolean;
  grupo?: {
    id: string;
    nome: string;
  };
}

export interface UserStats {
  byRole: Record<string, number>;
  total: number;
}

export interface BulkOperationResult {
  id: string;
  success: boolean;
  error?: string;
}

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  // For development mode, we'll simulate the API calls with local data
  // In production, this would make real HTTP requests to API_BASE_URL
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // For now, we'll work with the test users from localAuth
  return simulateApiCall(endpoint, options);
};

// Simulate API calls for development
const simulateApiCall = (endpoint: string, options: RequestInit = {}): any => {
  const method = options.method || 'GET';
  
  // Get test users from localStorage or use defaults
  const getTestUsers = (): UserWithDetails[] => {
    const testUsers = [
      {
        id: '1',
        name: 'Administrador',
        email: 'admin@igreja.com',
        role: 'admin' as UserRole,
        dataNascimento: new Date('1980-01-01'),
        genero: 'Masculino',
        estadoCivil: 'Casado(a)',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Principal',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        dataIngresso: new Date('2020-01-01'),
        batizado: true,
        isActive: true
      },
      {
        id: '2',
        name: 'Pastor João',
        email: 'pastor@igreja.com',
        role: 'pastor' as UserRole,
        dataNascimento: new Date('1975-05-15'),
        genero: 'Masculino',
        estadoCivil: 'Casado(a)',
        telefone: '(11) 98888-8888',
        endereco: 'Avenida da Igreja',
        numero: '456',
        bairro: 'Vila Nova',
        cidade: 'São Paulo',
        estado: 'SP',
        dataIngresso: new Date('2018-01-01'),
        batizado: true,
        isActive: true
      },
      {
        id: '3',
        name: 'Líder Maria',
        email: 'lider@igreja.com',
        role: 'lider' as UserRole,
        dataNascimento: new Date('1985-08-20'),
        genero: 'Feminino',
        estadoCivil: 'Solteiro(a)',
        telefone: '(11) 97777-7777',
        endereco: 'Rua das Flores',
        numero: '789',
        bairro: 'Jardim',
        cidade: 'São Paulo',
        estado: 'SP',
        dataIngresso: new Date('2019-06-01'),
        batizado: true,
        isActive: true
      },
      {
        id: '4',
        name: 'Tesoureiro Carlos',
        email: 'tesoureiro@igreja.com',
        role: 'tesoureiro' as UserRole,
        dataNascimento: new Date('1970-12-10'),
        genero: 'Masculino',
        estadoCivil: 'Casado(a)',
        telefone: '(11) 96666-6666',
        endereco: 'Rua do Comércio',
        numero: '321',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        dataIngresso: new Date('2017-03-01'),
        batizado: true,
        isActive: true
      },
      {
        id: '5',
        name: 'Voluntário Ana',
        email: 'voluntario@igreja.com',
        role: 'voluntario' as UserRole,
        dataNascimento: new Date('1990-03-25'),
        genero: 'Feminino',
        estadoCivil: 'Solteiro(a)',
        telefone: '(11) 95555-5555',
        endereco: 'Rua da Esperança',
        numero: '654',
        bairro: 'Vila Esperança',
        cidade: 'São Paulo',
        estado: 'SP',
        dataIngresso: new Date('2021-01-01'),
        batizado: true,
        isActive: true
      },
      {
        id: '6',
        name: 'Membro Pedro',
        email: 'membro@igreja.com',
        role: 'membro' as UserRole,
        dataNascimento: new Date('1995-07-30'),
        genero: 'Masculino',
        estadoCivil: 'Solteiro(a)',
        telefone: '(11) 94444-4444',
        endereco: 'Rua Nova',
        numero: '987',
        bairro: 'Bairro Novo',
        cidade: 'São Paulo',
        estado: 'SP',
        dataIngresso: new Date('2022-01-01'),
        batizado: false,
        isActive: true
      }
    ];
    
    // Try to get from localStorage, fallback to defaults
    const stored = localStorage.getItem('church_test_users');
    if (stored) {
      try {
        return JSON.parse(stored).map((user: any) => ({
          ...user,
          dataNascimento: new Date(user.dataNascimento),
          dataIngresso: new Date(user.dataIngresso)
        }));
      } catch {
        return testUsers;
      }
    }
    
    return testUsers;
  };
  
  const saveTestUsers = (users: UserWithDetails[]) => {
    localStorage.setItem('church_test_users', JSON.stringify(users));
  };
  
  if (endpoint.startsWith('/users')) {
    const users = getTestUsers();
    
    if (method === 'GET') {
      if (endpoint === '/users') {
        // List users with basic filtering
        return {
          success: true,
          users,
          pagination: {
            page: 1,
            limit: 50,
            total: users.length
          }
        };
      } else if (endpoint.match(/^\/users\/[^\/]+$/)) {
        // Get user by ID
        const id = endpoint.split('/')[2];
        const user = users.find(u => u.id === id);
        if (!user) {
          throw new Error('Usuário não encontrado');
        }
        return { success: true, user };
      } else if (endpoint === '/users/stats/overview') {
        // Get user statistics
        const roleStats: Record<string, number> = {};
        users.forEach(user => {
          roleStats[user.role] = (roleStats[user.role] || 0) + 1;
        });
        return {
          success: true,
          stats: {
            byRole: roleStats,
            total: users.length
          }
        };
      }
    } else if (method === 'POST') {
      if (endpoint === '/users') {
        // Create user
        const userData = JSON.parse(options.body as string);
        const newUser: UserWithDetails = {
          id: (users.length + 1).toString(),
          name: userData.nome,
          email: userData.email,
          role: userData.funcao,
          dataNascimento: new Date(userData.dataNascimento),
          genero: userData.genero,
          estadoCivil: userData.estadoCivil,
          telefone: userData.telefone,
          endereco: userData.endereco,
          numero: userData.numero,
          complemento: userData.complemento,
          bairro: userData.bairro,
          cidade: userData.cidade,
          estado: userData.estado,
          dataIngresso: new Date(userData.dataIngresso),
          batizado: userData.batizado,
          isActive: true
        };
        
        const updatedUsers = [...users, newUser];
        saveTestUsers(updatedUsers);
        
        return { success: true, user: newUser };
      } else if (endpoint.match(/^\/users\/[^\/]+\/(activate|deactivate|reset-password)$/)) {
        // User actions
        const parts = endpoint.split('/');
        const id = parts[2];
        const action = parts[3];
        
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          throw new Error('Usuário não encontrado');
        }
        
        if (action === 'activate') {
          users[userIndex].isActive = true;
        } else if (action === 'deactivate') {
          users[userIndex].isActive = false;
        } else if (action === 'reset-password') {
          const newPassword = Math.random().toString(36).slice(-8);
          saveTestUsers(users);
          return { success: true, newPassword };
        }
        
        saveTestUsers(users);
        return { success: true };
      } else if (endpoint.startsWith('/users/bulk/')) {
        // Bulk operations
        const { userIds } = JSON.parse(options.body as string);
        const action = endpoint.split('/')[3];
        
        const results = userIds.map((id: string) => {
          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex === -1) {
            return { id, success: false, error: 'Usuário não encontrado' };
          }
          
          if (action === 'activate') {
            users[userIndex].isActive = true;
          } else if (action === 'deactivate') {
            users[userIndex].isActive = false;
          }
          
          return { id, success: true };
        });
        
        saveTestUsers(users);
        return { success: true, results };
      }
    } else if (method === 'PUT') {
      // Update user
      const id = endpoint.split('/')[2];
      const userData = JSON.parse(options.body as string);
      
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado');
      }
      
      users[userIndex] = {
        ...users[userIndex],
        name: userData.nome || users[userIndex].name,
        email: userData.email || users[userIndex].email,
        role: userData.funcao || users[userIndex].role,
        dataNascimento: userData.dataNascimento ? new Date(userData.dataNascimento) : users[userIndex].dataNascimento,
        genero: userData.genero || users[userIndex].genero,
        estadoCivil: userData.estadoCivil || users[userIndex].estadoCivil,
        telefone: userData.telefone || users[userIndex].telefone,
        endereco: userData.endereco || users[userIndex].endereco,
        numero: userData.numero || users[userIndex].numero,
        complemento: userData.complemento !== undefined ? userData.complemento : users[userIndex].complemento,
        bairro: userData.bairro || users[userIndex].bairro,
        cidade: userData.cidade || users[userIndex].cidade,
        estado: userData.estado || users[userIndex].estado,
        dataIngresso: userData.dataIngresso ? new Date(userData.dataIngresso) : users[userIndex].dataIngresso,
        batizado: userData.batizado !== undefined ? userData.batizado : users[userIndex].batizado,
        isActive: userData.isActive !== undefined ? userData.isActive : users[userIndex].isActive
      };
      
      saveTestUsers(users);
      return { success: true, user: users[userIndex] };
    } else if (method === 'DELETE') {
      // Delete user
      const id = endpoint.split('/')[2];
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado');
      }
      
      users.splice(userIndex, 1);
      saveTestUsers(users);
      
      return { success: true };
    }
  }
  
  throw new Error('Endpoint não encontrado');
};

export const userManagementService = {
  // List users with filtering and pagination
  async listUsers(filters: UserFilters = {}): Promise<{ users: UserWithDetails[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiCall(`/users?${queryParams.toString()}`);
    return {
      users: response.users,
      pagination: response.pagination
    };
  },

  // Get user by ID
  async getUserById(id: string): Promise<UserWithDetails> {
    const response = await apiCall(`/users/${id}`);
    return response.user;
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<UserWithDetails> {
    const response = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.user;
  },

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<UserWithDetails> {
    const response = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.user;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Activate user
  async activateUser(id: string): Promise<void> {
    await apiCall(`/users/${id}/activate`, {
      method: 'POST',
    });
  },

  // Deactivate user
  async deactivateUser(id: string): Promise<void> {
    await apiCall(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  },

  // Reset user password
  async resetUserPassword(id: string): Promise<string> {
    const response = await apiCall(`/users/${id}/reset-password`, {
      method: 'POST',
    });
    return response.newPassword;
  },

  // Bulk activate users
  async bulkActivateUsers(userIds: string[]): Promise<BulkOperationResult[]> {
    const response = await apiCall('/users/bulk/activate', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
    return response.results;
  },

  // Bulk deactivate users
  async bulkDeactivateUsers(userIds: string[]): Promise<BulkOperationResult[]> {
    const response = await apiCall('/users/bulk/deactivate', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
    return response.results;
  },

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    const response = await apiCall('/users/stats/overview');
    return response.stats;
  },

  // Helper functions for role management
  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      admin: 'Administrador',
      pastor: 'Pastor',
      lider: 'Líder',
      tesoureiro: 'Tesoureiro',
      voluntario: 'Voluntário',
      membro: 'Membro'
    };
    return roleNames[role] || role;
  },

  getRoleColor(role: UserRole): string {
    const roleColors: Record<UserRole, string> = {
      admin: '#dc3545',
      pastor: '#6f42c1',
      lider: '#fd7e14',
      tesoureiro: '#20c997',
      voluntario: '#0dcaf0',
      membro: '#6c757d'
    };
    return roleColors[role] || '#6c757d';
  },

  getAllRoles(): { value: UserRole; label: string }[] {
    return [
      { value: 'admin', label: 'Administrador' },
      { value: 'pastor', label: 'Pastor' },
      { value: 'lider', label: 'Líder' },
      { value: 'tesoureiro', label: 'Tesoureiro' },
      { value: 'voluntario', label: 'Voluntário' },
      { value: 'membro', label: 'Membro' }
    ];
  },

  // Validation helpers
  validateUserData(userData: Partial<CreateUserData | UpdateUserData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (userData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(userData.telefone)) {
      errors.push('Telefone deve estar no formato (XX) XXXXX-XXXX');
    }

    // Check password only if it exists (for CreateUserData)
    const createData = userData as CreateUserData;
    if (createData.password && createData.password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format helpers
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }
};

export default userManagementService;