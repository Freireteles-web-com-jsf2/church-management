import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { dashboardCache } from '../services/cacheService';

// Tipos para os dados do dashboard
interface DashboardStats {
  pessoasAtivas?: number;
  gruposAtivos?: number;
  receitasMes?: number;
  aniversariantesHoje?: number;
}

interface FinancialChartData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface MemberDistributionData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface UpcomingEvent {
  id: string | number;
  name: string;
  date: string;
  time?: string;
  location?: string;
}

interface BirthdayPerson {
  id: string | number;
  name: string;
  date: string;
  age?: number;
  contact?: string;
}

interface RecentActivity {
  id: string;
  type: 'pessoa' | 'grupo' | 'evento' | 'financeiro' | 'patrimonio';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  description: string;
  timestamp: string | Date;
  relatedId: string;
}

export interface DashboardData {
  stats?: DashboardStats;
  charts?: {
    financialData?: FinancialChartData[];
    membersDistribution?: MemberDistributionData[];
  };
  upcomingEvents?: UpcomingEvent[];
  birthdays?: {
    month?: BirthdayPerson[];
  };
  recentActivities?: RecentActivity[];
}

interface UseCachedDashboardDataOptions {
  ttl?: number; // Time-to-live em milissegundos
  persistOffline?: boolean; // Se deve persistir para uso offline
  autoRefreshInterval?: number | null; // Intervalo de atualização automática (null para desativar)
}

interface UseCachedDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<DashboardData | null>;
  isStale: boolean; // Indica se os dados estão potencialmente desatualizados
}

/**
 * Hook para buscar e gerenciar dados do dashboard com cache inteligente
 */
export function useCachedDashboardData(
  period: 'month' | 'quarter' | 'year' = 'month',
  options: UseCachedDashboardDataOptions = {}
): UseCachedDashboardDataResult {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    persistOffline = true,
    autoRefreshInterval = 60 * 1000, // 1 minuto por padrão
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  // Chave de cache baseada no período
  const cacheKey = `dashboard_data_${period}`;

  // Função para buscar dados da API
  const fetchFromApi = useCallback(async (): Promise<DashboardData | null> => {
    try {
      const response = await axios.get('/api/dashboard/all', { params: { period } });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(`Erro na API: ${err.message}`);
      }
      throw err;
    }
  }, [period]);

  // Função para buscar dados com cache
  const fetchData = useCallback(async (forceRefresh = false): Promise<DashboardData | null> => {
    setLoading(true);
    
    try {
      // Verifica se há dados em cache e se não é uma atualização forçada
      if (!forceRefresh) {
        const cachedData = dashboardCache.get<DashboardData>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setError(null);
          setLastUpdate(new Date());
          setIsStale(false);
          setLoading(false);
          return cachedData;
        }
      }
      
      // Se não há cache ou é refresh forçado, busca da API
      const apiData = await fetchFromApi();
      
      // Armazena no cache
      dashboardCache.set(cacheKey, apiData, {
        ttl,
        persistOffline,
        compress: true // Comprime dados grandes
      });
      
      setData(apiData);
      setError(null);
      setLastUpdate(new Date());
      setIsStale(false);
      
      return apiData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar dados';
      setError(errorMessage);
      
      // Tenta usar cache mesmo em caso de erro
      const cachedData = dashboardCache.get<DashboardData>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsStale(true); // Marca como potencialmente desatualizado
        return cachedData;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, period, ttl, persistOffline]);

  // Função para forçar atualização
  const refetch = useCallback(async (): Promise<DashboardData | null> => {
    return fetchData(true);
  }, [fetchData]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efeito para auto-refresh
  useEffect(() => {
    if (!autoRefreshInterval) return;
    
    const intervalId = setInterval(() => {
      // Só atualiza se a página estiver visível
      if (document.visibilityState === 'visible') {
        fetchData(true).catch(console.error);
      } else {
        // Se a página não estiver visível, marca como potencialmente desatualizado
        setIsStale(true);
      }
    }, autoRefreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchData, autoRefreshInterval]);

  // Efeito para detectar quando a página volta a ficar visível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isStale) {
        fetchData(true).catch(console.error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchData, isStale]);

  // Efeito para invalidar cache quando o período muda
  useEffect(() => {
    // Limpa itens expirados do cache periodicamente
    dashboardCache.clearExpired();
  }, [period]);

  return { data, loading, error, lastUpdate, refetch, isStale };
}