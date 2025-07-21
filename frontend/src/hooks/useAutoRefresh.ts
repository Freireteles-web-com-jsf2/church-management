import { useEffect, useRef } from 'react';

/**
 * Hook para atualização automática de dados do dashboard.
 * @param refreshFn Função que busca/atualiza os dados
 * @param intervalMs Intervalo em milissegundos (ex: 30000 para 30s)
 * @param onUpdate (opcional) Callback chamado quando dados mudam
 */
export function useAutoRefresh<T = any>(refreshFn: () => Promise<T>, intervalMs: number = 60000, onUpdate?: (data: T) => void) {
  const lastDataRef = useRef<T | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAndDetect = async () => {
      try {
        const data = await refreshFn();
        if (!isMounted) return;
        // Detecta mudança de dados
        if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
          lastDataRef.current = data;
          if (onUpdate) onUpdate(data);
        }
      } catch (err) {
        // Pode adicionar notificação de erro aqui
        // console.error('Erro no auto refresh:', err);
      }
    };

    // Primeira chamada imediata
    fetchAndDetect();
    // Intervalo periódico
    timerRef.current = setInterval(fetchAndDetect, intervalMs);

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refreshFn, intervalMs, onUpdate]);
} 