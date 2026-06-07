import { useCallback, useEffect, useState } from 'react';
import { fetchDebrisAlerts } from '../services/nasaService';
import type { DebrisAlert } from '../types/telemetry';
import { AppError } from '../utils/AppError';

interface NasaDataState {
  data: DebrisAlert[];
  loading: boolean;
  error: AppError | null;
  reload: () => void;
}

/**
 * Consome o `nasaService` e expõe à UI apenas `{ data, loading, error, reload }`.
 * O Axios fica totalmente encapsulado: `error` é sempre um `AppError` de domínio.
 * Usado uma única vez pelo `TelemetryProvider`, que compartilha o resultado.
 */
export function useNasaData(): NasaDataState {
  const [data, setData] = useState<DebrisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDebrisAlerts());
    } catch (err) {
      setError(AppError.fromAxios(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);
    fetchDebrisAlerts()
      .then((alerts) => {
        if (active) setData(alerts);
      })
      .catch((err) => {
        if (active) setError(AppError.fromAxios(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error, reload: load };
}
