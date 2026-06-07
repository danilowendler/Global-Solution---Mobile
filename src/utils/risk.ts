import { riskColors } from '../theme';
import type { DebrisAlert, RiskLevel } from '../types/telemetry';

/** Cor semântica de cada nível de risco — fonte única, independente do tema. */
export function riskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'critical':
      return riskColors.riskCritical;
    case 'high':
      return riskColors.riskHigh;
    case 'moderate':
      return riskColors.riskModerate;
    case 'nominal':
      return riskColors.riskNominal;
  }
}

/** Rótulo curto exibido em badges e cabeçalhos. */
export function riskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'critical':
      return 'CRÍTICO';
    case 'high':
      return 'ALTO';
    case 'moderate':
      return 'MODERADO';
    case 'nominal':
      return 'NOMINAL';
  }
}

/** Severidade em ordem decrescente — eixo fixo de todos os agregados do dashboard. */
const RISK_ORDER: readonly RiskLevel[] = ['critical', 'high', 'moderate', 'nominal'];

/** Fatia da distribuição de risco — uma barra por nível no RiskChart. */
export interface RiskDatum {
  level: RiskLevel;
  label: string;
  color: string;
  count: number;
  /** Participação no total, 0–100. */
  pct: number;
}

/**
 * Agrega os alertas por nível de risco para o gráfico de densidade orbital.
 * Sempre retorna os quatro níveis (ordem crítico→nominal), com `pct` = 0 quando
 * não há objetos — protege a UI de divisão por zero em telemetria vazia.
 */
export function riskDistribution(alerts: DebrisAlert[]): RiskDatum[] {
  const total = alerts.length;
  return RISK_ORDER.map((level) => {
    const count = alerts.reduce((acc, alert) => (alert.risk === level ? acc + 1 : acc), 0);
    return {
      level,
      label: riskLabel(level),
      color: riskColor(level),
      count,
      pct: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
}

/** Indicadores de topo do dashboard — resumo de alvos rastreados. */
export interface TelemetrySummary {
  total: number;
  critical: number;
  high: number;
  /** TCA do alvo mais iminente, em minutos; `null` sem alvos. */
  nearestTcaMinutes: number | null;
  /** Menor distância de aproximação prevista, em km; `null` sem alvos. */
  minMissKm: number | null;
}

/** Deriva os indicadores do resumo a partir da telemetria já normalizada. */
export function summarizeTelemetry(alerts: DebrisAlert[]): TelemetrySummary {
  if (alerts.length === 0) {
    return { total: 0, critical: 0, high: 0, nearestTcaMinutes: null, minMissKm: null };
  }

  let critical = 0;
  let high = 0;
  let nearestTcaMinutes = Infinity;
  let minMissKm = Infinity;

  for (const alert of alerts) {
    if (alert.risk === 'critical') critical += 1;
    else if (alert.risk === 'high') high += 1;
    // Só aproximações futuras contam como "próximo TCA"; tca 0 = janela já encerrada.
    if (alert.tcaMinutes > 0 && alert.tcaMinutes < nearestTcaMinutes) {
      nearestTcaMinutes = alert.tcaMinutes;
    }
    if (alert.missDistanceKm < minMissKm) minMissKm = alert.missDistanceKm;
  }

  return {
    total: alerts.length,
    critical,
    high,
    nearestTcaMinutes: Number.isFinite(nearestTcaMinutes) ? nearestTcaMinutes : null,
    minMissKm,
  };
}
