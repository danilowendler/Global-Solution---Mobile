import { useMemo, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { riskColor, riskLabel } from '../utils/risk';
import Badge from './Badge';
import StatusIndicator from './StatusIndicator';

type Styles = ReturnType<typeof makeStyles>;

interface TacticalCardProps {
  alert: DebrisAlert;
  onPress?: () => void;
  /** Quando definido, exibe o controle de favoritar (estrela) no cabeçalho. */
  onToggleFavorite?: () => void;
  /** Estado atual do favorito — alterna o ícone star/star-outline e a cor. */
  isFavorite?: boolean;
}

function formatTca(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function TelemetryItem({
  label,
  value,
  color,
  styles,
}: {
  label: string;
  value: string;
  color?: string;
  styles: Styles;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

/**
 * Card de alerta de aproximação orbital. Barra de acento e badge codificam a
 * severidade; a telemetria é exibida em fonte monoespaçada. Severidade crítica
 * ganha um pulso sutil — microinteração funcional, não decorativa.
 */
export default function TacticalCard({
  alert,
  onPress,
  onToggleFavorite,
  isFavorite = false,
}: TacticalCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const color = riskColor(alert.risk);
  const isCritical = alert.risk === 'critical';
  const starScale = useRef(new Animated.Value(1)).current;

  // Microinteração funcional: pulso de escala ao alternar o favorito.
  const handleToggleFavorite = () => {
    Animated.sequence([
      Animated.timing(starScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.spring(starScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onToggleFavorite?.();
  };

  const content = (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.norad}>NORAD {alert.noradId}</Text>
            <Text style={styles.designation} numberOfLines={2}>
              {alert.designation}
            </Text>
          </View>
          <View style={styles.badgeBlock}>
            <View style={styles.badgeTop}>
              {onToggleFavorite ? (
                <Pressable
                  onPress={handleToggleFavorite}
                  hitSlop={spacing.sm}
                  accessibilityRole="button"
                  accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  style={({ pressed }) => (pressed ? styles.starPressed : null)}
                >
                  <Animated.View style={{ transform: [{ scale: starScale }] }}>
                    <MaterialCommunityIcons
                      name={isFavorite ? 'star' : 'star-outline'}
                      size={20}
                      color={isFavorite ? colors.accentAmber : colors.textMuted}
                    />
                  </Animated.View>
                </Pressable>
              ) : null}
              <Badge label={riskLabel(alert.risk)} color={color} />
            </View>
            {isCritical ? <StatusIndicator color={color} pulse size={7} style={styles.pulse} /> : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricsRow}>
          <TelemetryItem label="TCA" value={formatTca(alert.tcaMinutes)} color={color} styles={styles} />
          <TelemetryItem label="MISS" value={`${alert.missDistanceKm.toFixed(2)} km`} styles={styles} />
          <TelemetryItem
            label="Pc"
            value={`${(alert.collisionProbability * 100).toFixed(3)}%`}
            styles={styles}
          />
          <TelemetryItem label="ALT" value={`${alert.altitudeKm} km`} styles={styles} />
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : null)}>
      {content}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      width: '100%',
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    pressed: {
      opacity: 0.75,
    },
    accentBar: {
      width: borderWidth.accent,
    },
    body: {
      flex: 1,
      padding: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    titleBlock: {
      flex: 1,
    },
    norad: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    designation: {
      fontFamily: fontFamily.sans,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
      marginTop: spacing.xs / 2,
    },
    badgeBlock: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    badgeTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    starPressed: {
      opacity: 0.6,
    },
    pulse: {
      marginTop: spacing.xs / 2,
    },
    divider: {
      height: borderWidth.hairline,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    metricsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
    },
    metric: {
      minWidth: 64,
    },
    metricLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    metricValue: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
      marginTop: spacing.xs / 2,
    },
  });
