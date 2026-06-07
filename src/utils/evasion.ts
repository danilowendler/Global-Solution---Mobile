/**
 * Simulador de janela de evasão — modelo determinístico (front-end).
 *
 * Coerência de escala: a `missDistanceKm` que vem do NeoWs é em escala de
 * asteroide (centenas de milhares de km / múltiplos de distância lunar). Uma
 * manobra Δv realista gera separação de poucos km, desprezível contra esse
 * número. Por isso modelamos a evasão como **limpeza de um corredor de varredura
 * (screening volume)** — a prática real de avaliação de conjunção (CDM) consiste
 * em afastar o ativo o suficiente para esvaziar um corredor de poucos km ao redor
 * da trajetória prevista. Assim os controles (antecedência e impulso) movem o
 * resultado de forma significativa e o ensino "agir cedo salva" fica explícito.
 *
 * Como `classifyRisk`/`simulate*` em `nasaService.ts`, isto é uma simulação
 * determinística — o backlog (CLAUDE.md §8) prevê indicadores reais server-side.
 */

/** Raio do corredor de varredura que a manobra precisa esvaziar, em km. */
export const SCREENING_CORRIDOR_KM = 5;

/** Antecedências pré-definidas (em minutos) oferecidas ao operador. */
export const LEAD_TIME_PRESETS_MIN = [30, 120, 360, 720] as const;

/** Limites e passo do impulso Δv (m/s) ajustável no stepper. */
export const DELTA_V_MIN_MS = 0.1;
export const DELTA_V_MAX_MS = 2;
export const DELTA_V_STEP_MS = 0.1;
export const DELTA_V_DEFAULT_MS = 0.5;

/** Antecedência pré-selecionada (T-6h) — equilíbrio entre realismo e folga. */
export const LEAD_TIME_DEFAULT_MIN = 360;

export interface EvasionInput {
  /** Tempo até a aproximação máxima (TCA), em minutos. */
  tcaMinutes: number;
  /** Antecedência escolhida para iniciar a manobra, em minutos. */
  leadTimeMinutes: number;
  /** Impulso da manobra, em m/s. */
  deltaVMs: number;
}

export interface EvasionResult {
  /** Antecedência efetiva — limitada pela janela restante até o TCA, em minutos. */
  effectiveLeadMinutes: number;
  /** Separação adicional projetada pela manobra, em km. */
  gainedSeparationKm: number;
  /** Corredor de varredura que precisa ser esvaziado, em km. */
  requiredClearanceKm: number;
  /** A manobra esvazia o corredor? */
  feasible: boolean;
  /** Quanto ainda falta para esvaziar o corredor, em km (0 quando viável). */
  deficitKm: number;
  /**
   * Antecedência mínima (min) para o Δv atual esvaziar o corredor dentro da
   * janela. `null` quando a janela está encerrada ou nem agir agora resolve.
   */
  minLeadMinutes: number | null;
  /** Janela de manobra encerrada (TCA já atingido). */
  windowClosed: boolean;
}

/** Rótulo curto de uma antecedência preset — `T-30m`, `T-2h`, … */
export function leadLabel(minutes: number): string {
  if (minutes < 60) return `T-${minutes}m`;
  return `T-${Math.round(minutes / 60)}h`;
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Projeta o resultado de uma manobra de evasão. Função pura: a UI só formata e
 * apresenta — nenhuma regra de negócio vaza para o JSX.
 */
export function simulateEvasion({
  tcaMinutes,
  leadTimeMinutes,
  deltaVMs,
}: EvasionInput): EvasionResult {
  const windowClosed = tcaMinutes <= 0;
  const effectiveLeadMinutes = Math.max(0, Math.min(leadTimeMinutes, tcaMinutes));

  // Separação ≈ Δv (m/s) × tempo de atuação (s) → metros → km.
  const gainedSeparationKm = round2((deltaVMs * effectiveLeadMinutes * 60) / 1000);
  const requiredClearanceKm = SCREENING_CORRIDOR_KM;
  // Veredito e déficit derivam do valor JÁ arredondado exibido na UI — evita um
  // "Faltam 0.00 km" coexistir com veredito INSUFICIENTE em casos de fronteira.
  const feasible = gainedSeparationKm >= requiredClearanceKm;
  const deficitKm = feasible ? 0 : round2(requiredClearanceKm - gainedSeparationKm);

  // Inversão do modelo: antecedência mínima para o Δv atual atingir o corredor.
  const minLeadRaw =
    deltaVMs > 0 ? (requiredClearanceKm * 1000) / (deltaVMs * 60) : Infinity;
  const minLeadMinutes =
    windowClosed || !Number.isFinite(minLeadRaw) || minLeadRaw > tcaMinutes
      ? null
      : Math.ceil(minLeadRaw);

  return {
    effectiveLeadMinutes,
    gainedSeparationKm,
    requiredClearanceKm,
    feasible,
    deficitKm,
    minLeadMinutes,
    windowClosed,
  };
}
