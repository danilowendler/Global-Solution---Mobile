import { useCallback, useEffect, useState } from 'react';
import { fetchStationWeather, type WeatherQuery } from '../services/weatherService';
import type { StationWeather } from '../types/weather';
import { AppError } from '../utils/AppError';

interface WeatherState {
  data: StationWeather | null;
  loading: boolean;
  error: AppError | null;
  reload: () => void;
}

/**
 * Consome o `weatherService` para um local específico (ou a estação padrão) e
 * expõe à UI apenas `{ data, loading, error, reload }`. A `queryKey` serializada
 * estabiliza o efeito quando o chamador passa o objeto de consulta inline.
 */
export function useWeather(query?: WeatherQuery): WeatherState {
  const [data, setData] = useState<StationWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const queryKey = query ? JSON.stringify(query) : 'default';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchStationWeather(query));
    } catch (err) {
      setError(AppError.fromAxios(err));
    } finally {
      setLoading(false);
    }
    // `query` é capturado via `queryKey`, que muda junto com ele.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);
    fetchStationWeather(query)
      .then((station) => {
        if (active) setData(station);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { data, loading, error, reload: load };
}
