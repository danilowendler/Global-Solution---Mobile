import { createContext, useMemo, type ReactNode } from 'react';
import { useNasaData } from '../hooks/useNasaData';
import type { DebrisAlert } from '../types/telemetry';
import type { AppError } from '../utils/AppError';

/**
 * Estado de telemetria orbital compartilhado por todo o console. Espelha o
 * contrato de `useNasaData`, mas garante uma **única** busca à NASA por sessão —
 * Home e Listagens consomem a mesma instância, evitando chamadas duplicadas
 * (o `DEMO_KEY` tem limite agressivo de requisições).
 */
export interface TelemetryContextValue {
  data: DebrisAlert[];
  loading: boolean;
  error: AppError | null;
  reload: () => void;
}

export const TelemetryContext = createContext<TelemetryContextValue | undefined>(undefined);

/** Lifta uma instância de `useNasaData` para o contexto, sem reescrever o fetch. */
export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, reload } = useNasaData();

  // Memoizado por campo: a referência do value só muda quando a telemetria de
  // fato muda, evitando re-render desnecessário de Home/Listagens.
  const value = useMemo<TelemetryContextValue>(
    () => ({ data, loading, error, reload }),
    [data, loading, error, reload],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}
