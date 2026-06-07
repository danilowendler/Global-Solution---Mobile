import { createHttpClient } from './http';
import type {
  NasaCloseApproach,
  NasaNeoFeedResponse,
  NasaNeoObject,
} from '../types/api';
import type { DebrisAlert, RiskLevel } from '../types/telemetry';

const nasaHttp = createHttpClient('https://api.nasa.gov');

/** Em dev, sem chave, a NASA libera o `DEMO_KEY` (com limite baixo de requisições). */
const NASA_API_KEY = process.env.EXPO_PUBLIC_NASA_KEY || 'DEMO_KEY';

/* ---------------------------------------------------------------------------
 * Classificação de risco local — "simulação de ML".
 *
 * O backlog (CLAUDE.md §8) prevê substituir isto por indicadores calculados
 * server-side. Nesta entrega, derivamos o risco no dispositivo a partir da
 * distância mínima de aproximação e da velocidade relativa, espelhando a lógica
 * de TCA/probabilidade de colisão. Distâncias expressas em múltiplos da
 * distância lunar (LD ≈ 384.400 km) para manter a escala interpretável.
 * ------------------------------------------------------------------------- */

const LUNAR_DISTANCE_KM = 384_400;
const CRITICAL_MISS_KM = 2 * LUNAR_DISTANCE_KM;
const CRITICAL_VELOCITY_KMS = 15;
const HAZARDOUS_MISS_KM = 5 * LUNAR_DISTANCE_KM;
const HIGH_MISS_KM = 10 * LUNAR_DISTANCE_KM;
const MODERATE_MISS_KM = 30 * LUNAR_DISTANCE_KM;

function classifyRisk(missKm: number, velocityKmS: number, isHazardous: boolean): RiskLevel {
  const criticalProximity = missKm < CRITICAL_MISS_KM && velocityKmS > CRITICAL_VELOCITY_KMS;
  if (criticalProximity || (isHazardous && missKm < HAZARDOUS_MISS_KM)) {
    return 'critical';
  }
  if (missKm < HIGH_MISS_KM) return 'high';
  if (missKm < MODERATE_MISS_KM) return 'moderate';
  return 'nominal';
}

/**
 * Probabilidade de colisão (Pc) simulada, 0–1. O NeoWs não expõe Pc; derivamos
 * um proxy determinístico que cresce conforme o objeto se aproxima e acelera.
 */
function simulateCollisionProbability(missKm: number, velocityKmS: number): number {
  const proximity = Math.max(0, 1 - missKm / MODERATE_MISS_KM);
  const velocityFactor = Math.min(1, velocityKmS / 40);
  return Number((proximity * 0.85 + velocityFactor * 0.15).toFixed(4));
}

/**
 * Altitude orbital simulada (km). O NeoWs reporta distâncias de aproximação à
 * Terra (centenas de milhares de km), não altitude em LEO. Projetamos a
 * distância mínima na faixa LEO (160–2000 km) de forma determinística — objetos
 * mais próximos "aparecem" mais baixos — apenas para fins de visualização.
 */
function simulateAltitudeKm(missKm: number): number {
  const LEO_MIN = 160;
  const LEO_MAX = 2_000;
  const ratio = Math.min(1, missKm / MODERATE_MISS_KM);
  return Math.round(LEO_MIN + ratio * (LEO_MAX - LEO_MIN));
}

/**
 * Converte valores numéricos do payload da NASA (frequentemente `string`) em
 * `number`, descartando `undefined`/`null`/`NaN`/`Infinity`. Blinda toda a
 * matemática de risco contra `NaN` silencioso.
 */
function parseFinite(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toTcaMinutes(epochMs: number | null | undefined): number {
  const epoch = parseFinite(epochMs);
  if (epoch === null) return 0;
  return Math.max(0, Math.round((epoch - Date.now()) / 60_000));
}

/**
 * Normaliza um objeto NeoWs em `DebrisAlert`. Retorna `null` quando a telemetria
 * é inutilizável (sem distância mínima parseável) — esses objetos são descartados
 * em vez de virarem alertas com campos `NaN`.
 */
function mapNeoToDebrisAlert(neo: NasaNeoObject, approach: NasaCloseApproach): DebrisAlert | null {
  const missDistanceKm = parseFinite(approach.miss_distance?.kilometers);
  // Distância mínima é o eixo da classificação; sem ela o registro não é confiável.
  if (missDistanceKm === null) return null;

  const velocityKmS = parseFinite(approach.relative_velocity?.kilometers_per_second) ?? 0;

  return {
    // Único por aproximação: na janela multi-dia o mesmo objeto pode reaparecer
    // em datas diferentes — o epoch distingue cada evento de conjunção.
    id: `${neo.id}-${approach.epoch_date_close_approach}`,
    // O NeoWs não traz catálogo NORAD; usamos o `neo_reference_id` como proxy.
    noradId: neo.neo_reference_id,
    designation: (neo.name ?? 'Objeto desconhecido').replace(/[()]/g, '').trim(),
    risk: classifyRisk(missDistanceKm, velocityKmS, neo.is_potentially_hazardous_asteroid === true),
    tcaMinutes: toTcaMinutes(approach.epoch_date_close_approach),
    missDistanceKm,
    collisionProbability: simulateCollisionProbability(missDistanceKm, velocityKmS),
    altitudeKm: simulateAltitudeKm(missDistanceKm),
  };
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const RISK_RANK: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  nominal: 3,
};

/**
 * Janela de dias do feed. Mais de 1 dia garante aproximações **futuras** (com TCA
 * vivo para a contagem e o simulador de evasão) mesmo quando as de hoje já
 * passaram. O endpoint `feed` aceita até 7 dias por requisição — mesmo custo de
 * cota que 1 dia, só com mais resultados.
 */
const FEED_WINDOW_DAYS = 2;

/**
 * Busca as aproximações da janela no Asteroids NeoWs e as normaliza para
 * `DebrisAlert[]` — já classificadas por risco e ordenadas da mais crítica para
 * a mais nominal. Erros chegam aqui como `AppError` (via interceptor) e são
 * apenas propagados para o hook.
 */
export async function fetchDebrisAlerts(): Promise<DebrisAlert[]> {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + FEED_WINDOW_DAYS);

  const { data } = await nasaHttp.get<NasaNeoFeedResponse>('/neo/rest/v1/feed', {
    params: {
      start_date: toIsoDate(start),
      end_date: toIsoDate(end),
      api_key: NASA_API_KEY,
    },
  });

  const alerts: DebrisAlert[] = [];
  for (const neos of Object.values(data?.near_earth_objects ?? {})) {
    for (const neo of neos ?? []) {
      const approach = neo.close_approach_data?.[0];
      if (!approach) continue;
      const alert = mapNeoToDebrisAlert(neo, approach);
      if (alert) alerts.push(alert);
    }
  }

  return alerts.sort(
    (a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk] || a.missDistanceKm - b.missDistanceKm,
  );
}
