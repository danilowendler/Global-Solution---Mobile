import { Platform } from 'react-native';

/**
 * Tipografia tática. Sem fontes externas (proibido instalar novas dependências):
 * usamos a família monoespaçada nativa de cada plataforma para telemetria e
 * coordenadas, e a fonte de sistema para texto comum.
 */
const monoFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  default: 'monospace',
});

export const fontFamily = {
  mono: monoFamily,
  sans: Platform.select({ ios: 'System', default: 'sans-serif' }),
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 16,
  normal: 20,
  relaxed: 26,
} as const;

/** Espaçamento entre caracteres — telemetria e títulos respiram mais. */
export const letterSpacing = {
  normal: 0,
  wide: 1,
  wider: 2,
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
