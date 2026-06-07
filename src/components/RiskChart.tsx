import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
import { riskDistribution } from '../utils/risk';

interface RiskChartProps {
  alerts: DebrisAlert[];
}

/**
 * Gráfico tático de distribuição de risco — 100% Flexbox, sem libs externas.
 * Uma barra de densidade empilhada resume a proporção de cada severidade; abaixo,
 * uma linha por nível detalha contagem e participação. O cálculo vive em
 * `riskDistribution` (util puro); aqui só desenhamos. Fade-in sóbrio no mount.
 */
export default function RiskChart({ alerts }: RiskChartProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Agregação memoizada: a densidade só é recalculada quando a telemetria muda,
  // não a cada re-render disparado por interação na Home (preserva o FPS).
  const data = useMemo(() => riskDistribution(alerts), [alerts]);
  const segments = useMemo(() => data.filter((datum) => datum.count > 0), [data]);
  const total = alerts.length;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    });
    animation.start();
    // Cleanup: interrompe a animação se o componente desmontar no meio do fade,
    // evitando callbacks pendentes sobre um nó já removido.
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          DISTRIBUIÇÃO DE RISCO
        </Text>
        <Text style={styles.total}>{total} OBJ</Text>
      </View>

      <View style={styles.densityBar}>
        {segments.length === 0 ? (
          <View style={[styles.segment, styles.segmentEmpty]} />
        ) : (
          segments.map((datum) => (
            <View
              key={datum.level}
              style={[styles.segment, { flexGrow: datum.count, backgroundColor: datum.color }]}
            />
          ))
        )}
      </View>

      <View style={styles.rows}>
        {data.map((datum) => (
          <View key={datum.level} style={styles.row}>
            <Text style={styles.rowLabel}>{datum.label}</Text>
            <View style={styles.track}>
              <View
                style={[styles.fill, { width: `${datum.pct}%`, backgroundColor: datum.color }]}
              />
            </View>
            <Text style={styles.rowCount}>{String(datum.count).padStart(2, '0')}</Text>
            <Text style={[styles.rowPct, { color: datum.color }]}>{datum.pct}%</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      flexShrink: 1,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
    },
    total: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.accent,
      letterSpacing: letterSpacing.wide,
      marginLeft: spacing.sm,
    },
    densityBar: {
      flexDirection: 'row',
      height: 10,
      borderRadius: radius.pill,
      overflow: 'hidden',
      backgroundColor: colors.background,
      gap: borderWidth.hairline,
    },
    segment: {
      height: '100%',
    },
    segmentEmpty: {
      flex: 1,
      backgroundColor: colors.border,
    },
    rows: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowLabel: {
      width: 78,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      letterSpacing: letterSpacing.wide,
    },
    track: {
      flex: 1,
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radius.pill,
    },
    rowCount: {
      width: 22,
      textAlign: 'right',
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
    },
    rowPct: {
      width: 40,
      textAlign: 'right',
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
  });
