/**
 * Cache Service - Sistema de cache inteligente para o dashboard
 * 
 * Este serviço implementa:
 * - Cache de dados com TTL (Time-To-Live)
 * - Estratégia de invalidação de cache
 * - Suporte para cache offline
 * - Compressão de dados (para grandes conjuntos)
 */

import LZString from 'lz-string';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time-to-live em milissegundos
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time-to-live em milissegundos (padrão: 5 minutos)
  compress?: boolean; // Se deve comprimir dados grandes
  persistOffline?: boolean; // Se deve persistir para uso offline
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
const CACHE_PREFIX = 'dashboard_cache_';
const CACHE_KEYS_KEY = 'dashboard_cache_keys';

/**
 * Comprime dados grandes usando LZString
 * Nota: Em uma implementação real, usaríamos uma biblioteca como lz-string
 */
const compressData = (data: any): string => {
  return LZString.compressToUTF16(JSON.stringify(data));
};

/**
 * Descomprime dados
 */
const decompressData = (compressed: string): any => {
  try {
    const json = LZString.decompressFromUTF16(compressed);
    return JSON.parse(json!);
  } catch (e) {
    return null;
  }
};

/**
 * Serviço de cache para o dashboard
 */
export class DashboardCacheService {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private cacheKeys: Set<string> = new Set();

  constructor() {
    this.loadCacheKeys();
  }

  /**
   * Carrega as chaves de cache do localStorage
   */
  private loadCacheKeys(): void {
    try {
      const keys = localStorage.getItem(CACHE_KEYS_KEY);
      if (keys) {
        this.cacheKeys = new Set(JSON.parse(keys));
      }
    } catch (e) {
      console.error('Erro ao carregar chaves de cache:', e);
      this.cacheKeys = new Set();
    }
  }

  /**
   * Salva as chaves de cache no localStorage
   */
  private saveCacheKeys(): void {
    try {
      localStorage.setItem(CACHE_KEYS_KEY, JSON.stringify([...this.cacheKeys]));
    } catch (e) {
      console.error('Erro ao salvar chaves de cache:', e);
    }
  }

  /**
   * Armazena dados no cache
   * @param key Chave do cache
   * @param data Dados a serem armazenados
   * @param options Opções de cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = DEFAULT_TTL, compress = false, persistOffline = false } = options;
    const timestamp = Date.now();
    const cacheKey = `${CACHE_PREFIX}${key}`;

    // Armazena em memória para acesso rápido
    this.memoryCache.set(key, { data, timestamp, ttl, key });

    // Persiste no localStorage se necessário
    if (persistOffline) {
      try {
        const storageData = compress ? compressData(data) : JSON.stringify(data);
        localStorage.setItem(cacheKey, JSON.stringify({
          data: storageData,
          timestamp,
          ttl,
          compressed: compress
        }));
        this.cacheKeys.add(key);
        this.saveCacheKeys();
      } catch (e) {
        console.error(`Erro ao armazenar cache para ${key}:`, e);
      }
    }
  }

  /**
   * Recupera dados do cache
   * @param key Chave do cache
   * @returns Dados armazenados ou null se expirado/não encontrado
   */
  get<T>(key: string): T | null {
    // Tenta primeiro da memória (mais rápido)
    const memoryItem = this.memoryCache.get(key);
    
    if (memoryItem) {
      // Verifica se o cache expirou
      if (Date.now() - memoryItem.timestamp < memoryItem.ttl) {
        return memoryItem.data as T;
      } else {
        // Remove da memória se expirou
        this.memoryCache.delete(key);
      }
    }

    // Se não estiver na memória ou expirou, tenta do localStorage
    const cacheKey = `${CACHE_PREFIX}${key}`;
    try {
      const storedItem = localStorage.getItem(cacheKey);
      if (storedItem) {
        const { data, timestamp, ttl, compressed } = JSON.parse(storedItem);
        
        // Verifica se o cache expirou
        if (Date.now() - timestamp < ttl) {
          // Descomprime se necessário
          const parsedData = compressed ? decompressData(data) : JSON.parse(data);
          
          // Atualiza o cache em memória
          this.memoryCache.set(key, { data: parsedData, timestamp, ttl, key });
          
          return parsedData as T;
        } else {
          // Remove do localStorage se expirou
          localStorage.removeItem(cacheKey);
          this.cacheKeys.delete(key);
          this.saveCacheKeys();
        }
      }
    } catch (e) {
      console.error(`Erro ao recuperar cache para ${key}:`, e);
    }
    
    return null;
  }

  /**
   * Invalida um item específico do cache
   * @param key Chave do cache a ser invalidada
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
    this.cacheKeys.delete(key);
    this.saveCacheKeys();
  }

  /**
   * Invalida todos os itens de cache que correspondem a um padrão
   * @param pattern Padrão para correspondência (ex: 'dashboard_*')
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    // Invalida na memória
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Invalida no localStorage
    const keysToRemove: string[] = [];
    for (const key of this.cacheKeys) {
      if (regex.test(key)) {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        localStorage.removeItem(cacheKey);
        keysToRemove.push(key);
      }
    }
    
    // Atualiza o conjunto de chaves
    keysToRemove.forEach(key => this.cacheKeys.delete(key));
    this.saveCacheKeys();
  }

  /**
   * Invalida todo o cache
   */
  invalidateAll(): void {
    this.memoryCache.clear();
    
    // Remove todos os itens do localStorage
    for (const key of this.cacheKeys) {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      localStorage.removeItem(cacheKey);
    }
    
    this.cacheKeys.clear();
    this.saveCacheKeys();
  }

  /**
   * Verifica se um item está no cache e não expirou
   * @param key Chave do cache
   * @returns true se o item estiver válido no cache
   */
  has(key: string): boolean {
    // Verifica primeiro na memória
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && Date.now() - memoryItem.timestamp < memoryItem.ttl) {
      return true;
    }
    
    // Verifica no localStorage
    const cacheKey = `${CACHE_PREFIX}${key}`;
    try {
      const storedItem = localStorage.getItem(cacheKey);
      if (storedItem) {
        const { timestamp, ttl } = JSON.parse(storedItem);
        return Date.now() - timestamp < ttl;
      }
    } catch (e) {
      console.error(`Erro ao verificar cache para ${key}:`, e);
    }
    
    return false;
  }

  /**
   * Atualiza o TTL de um item no cache
   * @param key Chave do cache
   * @param newTtl Novo TTL em milissegundos
   */
  updateTtl(key: string, newTtl: number): void {
    // Atualiza na memória
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      memoryItem.ttl = newTtl;
    }
    
    // Atualiza no localStorage
    const cacheKey = `${CACHE_PREFIX}${key}`;
    try {
      const storedItemStr = localStorage.getItem(cacheKey);
      if (storedItemStr) {
        const storedItem = JSON.parse(storedItemStr);
        storedItem.ttl = newTtl;
        localStorage.setItem(cacheKey, JSON.stringify(storedItem));
      }
    } catch (e) {
      console.error(`Erro ao atualizar TTL para ${key}:`, e);
    }
  }

  /**
   * Limpa itens expirados do cache
   */
  clearExpired(): void {
    const now = Date.now();
    
    // Limpa da memória
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp >= item.ttl) {
        this.memoryCache.delete(key);
      }
    }
    
    // Limpa do localStorage
    const keysToRemove: string[] = [];
    for (const key of this.cacheKeys) {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      try {
        const storedItemStr = localStorage.getItem(cacheKey);
        if (storedItemStr) {
          const { timestamp, ttl } = JSON.parse(storedItemStr);
          if (now - timestamp >= ttl) {
            localStorage.removeItem(cacheKey);
            keysToRemove.push(key);
          }
        } else {
          // Se o item não existe mais, remove da lista de chaves
          keysToRemove.push(key);
        }
      } catch (e) {
        console.error(`Erro ao limpar cache expirado para ${key}:`, e);
      }
    }
    
    // Atualiza o conjunto de chaves
    keysToRemove.forEach(key => this.cacheKeys.delete(key));
    this.saveCacheKeys();
  }
}

// Exporta uma instância singleton do serviço de cache
export const dashboardCache = new DashboardCacheService();