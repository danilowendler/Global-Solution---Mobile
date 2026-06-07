/**
 * Domínio de telemetria orbital consumido pela UI do Argus.
 *
 * Nota: nesta fase (M2) os dados são mockados. No M3 a Service Layer normaliza
 * as respostas das APIs (NASA / Supabase) exatamente para este shape, de modo
 * que telas e componentes nunca precisem mudar.
 */

/** Nível de risco de colisão classificado pelos modelos ML (Argus). */
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'nominal';

/** Alerta de aproximação (conjunction) entre um ativo e um detrito em LEO. */
export interface DebrisAlert {
  id: string;
  /** Catálogo NORAD do objeto rastreado. */
  noradId: string;
  /** Designação legível do objeto/detrito. */
  designation: string;
  risk: RiskLevel;
  /** Tempo até a aproximação máxima (TCA — Time of Closest Approach), em minutos. */
  tcaMinutes: number;
  /** Distância mínima prevista entre os objetos, em km. */
  missDistanceKm: number;
  /** Probabilidade de colisão (Pc), 0–1. */
  collisionProbability: number;
  /** Altitude orbital do evento, em km. */
  altitudeKm: number;
}
