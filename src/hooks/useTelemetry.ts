import { useContext } from 'react';
import { TelemetryContext, type TelemetryContextValue } from '../contexts/TelemetryContext';

/** Acessa a telemetria orbital compartilhada. Lança fora do `TelemetryProvider`. */
export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (ctx === undefined) {
    throw new Error('useTelemetry deve ser usado dentro de um <TelemetryProvider>.');
  }
  return ctx;
}
