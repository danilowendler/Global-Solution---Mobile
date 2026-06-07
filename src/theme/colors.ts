/**
 * Tokens de cor — paleta tática Argus.
 *
 * Identidade de console de operações: o Dark Mode é o padrão (CLAUDE.md §2). O
 * Light Mode é uma variação secundária para ambientes muito iluminados — mesma
 * estrutura semântica, contraste invertido. As três camadas de fundo
 * (background → surface → surfaceElevated) criam a profundidade dos cards.
 *
 * A escala de risco de colisão é **independente do tema**: vermelho/âmbar/verde
 * comunicam severidade e devem permanecer vívidos em ambos os modos.
 */

/** Escala semântica de risco — consumida por TacticalCard, Badge, StatusIndicator, RiskChart. */
export const riskColors = {
  riskCritical: '#ef4444', // red-500
  riskHigh: '#f59e0b', // amber-500
  riskModerate: '#eab308', // yellow-500
  riskNominal: '#22c55e', // green-500
} as const;

/** Paleta dark (padrão) — fundos slate quase-pretos, acentos ciano/âmbar. */
export const darkColors = {
  /** slate-950 — fundo base do app */
  background: '#020617',
  /** slate-900 — superfície (tab bar, header, painéis) */
  surface: '#0f172a',
  /** slate-800 — cards elevados sobre a superfície */
  surfaceElevated: '#1e293b',
  /** slate-700 — bordas/divisores */
  border: '#334155',

  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  /** slate-500 — texto terciário / labels de telemetria */
  textMuted: '#64748b',

  /** ciano — dado ativo / acento primário */
  accent: '#22d3ee',
  /** âmbar — dado em destaque / acento secundário */
  accentAmber: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',

  ...riskColors,
} as const;

/** Paleta light (secundária) — fundos slate claros, acentos escurecidos p/ contraste. */
export const lightColors = {
  /** slate-100 — fundo base claro */
  background: '#e2e8f0',
  /** branco — superfície */
  surface: '#f8fafc',
  /** branco puro — cards elevados */
  surfaceElevated: '#ffffff',
  /** slate-300 — bordas/divisores */
  border: '#cbd5e1',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',

  /** ciano-600 — acento legível sobre claro */
  accent: '#0891b2',
  /** âmbar-700 */
  accentAmber: '#b45309',
  danger: '#dc2626',
  success: '#16a34a',

  ...riskColors,
} as const;

/**
 * Contrato de cor que todo componente consome via `useTheme()`. As chaves vêm da
 * paleta dark (fonte da verdade estrutural), mas os valores são `string` para que
 * dark e light — com hexadecimais distintos — satisfaçam o mesmo tipo.
 */
export type Palette = { readonly [K in keyof typeof darkColors]: string };

/**
 * Export estático de compatibilidade = paleta dark. Mantido como rede de
 * segurança para qualquer consumo fora de componentes (ex.: utilitários puros);
 * a UI deve ler as cores de `useTheme()` para reagir à troca de tema.
 */
export const colors: Palette = darkColors;

export type ColorToken = keyof Palette;
