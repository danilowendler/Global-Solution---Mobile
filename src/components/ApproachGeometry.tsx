import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import {
  borderWidth,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  spacing,
  type Palette,
} from '../theme';
import { useTheme } from '../hooks/useTheme';
import type { DebrisAlert } from '../types/telemetry';
import { riskColor } from '../utils/risk';
import { SCREENING_CORRIDOR_KM } from '../utils/evasion';

interface ApproachGeometryProps {
  alert: DebrisAlert;
}

/**
 * Faixa visual de referência (km). A distância de aproximação real é em escala de
 * asteroide; mapeamos em escala logarítmica para que objetos próximos fiquem
 * perto do ativo e distantes perto da borda — leitura, não medida exata.
 */
const VISUAL_MIN_KM = 50_000;
const VISUAL_MAX_KM = 12_000_000;

/** Posição do objeto na trilha (0 = colado no ativo, 100 = borda externa). */
function trackPosition(missKm: number): number {
  // O clamp também blinda contra Math.log(0)/log(negativo) → NaN.
  const clamped = Math.min(VISUAL_MAX_KM, Math.max(VISUAL_MIN_KM, missKm));
  const t =
    (Math.log(clamped) - Math.log(VISUAL_MIN_KM)) /
    (Math.log(VISUAL_MAX_KM) - Math.log(VISUAL_MIN_KM));
  // Margem nas pontas para o ativo e o objeto nunca colarem nas bordas.
  return 8 + t * 84;
}

/**
 * Esquema tático da conjunção: o ativo (LEO) à esquerda, o objeto rastreado
 * plotado na trilha pela distância de aproximação e o corredor de varredura que a
 * evasão precisa esvaziar. 100% Flexbox/Views — sem SVG nem libs de terceiros.
 */
export default function ApproachGeometry({ alert }: ApproachGeometryProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const color = riskColor(alert.risk);
  const position = trackPosition(alert.missDistanceKm);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GEOMETRIA DE APROXIMAÇÃO</Text>

      <View style={styles.row}>
        <MaterialCommunityIcons name="earth" size={22} color={colors.accent} />

        <View style={styles.track}>
          <View style={styles.baseline} />
          <View style={styles.plot}>
            <View style={[styles.corridor, { backgroundColor: colors.success }]} />
            <View style={{ flex: position }} />
            <View style={[styles.dotHalo, { borderColor: color }]}>
              <View style={[styles.dot, { backgroundColor: color }]} />
            </View>
            <View style={{ flex: 100 - position }} />
          </View>
        </View>
      </View>

      <View style={styles.labels}>
        <Text style={styles.assetLabel}>ATIVO · LEO</Text>
        <Text style={[styles.missLabel, { color }]}>
          MISS {alert.missDistanceKm.toFixed(0)} km
        </Text>
      </View>

      <Text style={styles.footer}>
        Corredor de varredura: {SCREENING_CORRIDOR_KM} km · {alert.designation}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
    },
    title: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    track: {
      flex: 1,
      height: 28,
      justifyContent: 'center',
    },
    baseline: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: borderWidth.hairline,
      backgroundColor: colors.border,
    },
    plot: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    corridor: {
      width: borderWidth.accent,
      height: 14,
      borderRadius: radius.pill,
      opacity: 0.6,
      marginRight: spacing.xs,
    },
    dotHalo: {
      width: 16,
      height: 16,
      borderRadius: radius.pill,
      borderWidth: borderWidth.hairline,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radius.pill,
    },
    labels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    assetLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    missLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    footer: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
  });
