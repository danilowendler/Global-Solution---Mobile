/**
 * Barrel do Design System Argus. Importe os tokens por aqui:
 *   import { colors, spacing, radius, fontFamily } from '../theme';
 */
export { colors, darkColors, lightColors, riskColors, type Palette, type ColorToken } from './colors';
export { spacing, radius, borderWidth, type SpacingToken, type RadiusToken } from './spacing';
export {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  type FontSizeToken,
  type FontWeightToken,
} from './typography';

import { colors } from './colors';
import { spacing, radius, borderWidth } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from './typography';

/** Objeto de tema combinado, útil para passar adiante ou desestruturar. */
export const theme = {
  colors,
  spacing,
  radius,
  borderWidth,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} as const;
