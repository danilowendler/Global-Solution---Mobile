import { useMemo, type ReactNode } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWeather } from '../hooks/useWeather';
import { useTheme } from '../hooks/useTheme';
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
import type { StationWeather } from '../types/weather';
import { weatherIcon } from '../utils/weather';
import SkeletonLoader from './SkeletonLoader';

type Styles = ReturnType<typeof makeStyles>;

function WeatherMetric({ label, value, styles }: { label: string; value: string; styles: Styles }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function WeatherBody({
  station,
  styles,
  accent,
}: {
  station: StationWeather;
  styles: Styles;
  accent: string;
}) {
  return (
    <>
      <View style={styles.topRow}>
        <MaterialCommunityIcons name={weatherIcon(station.icon)} size={44} color={accent} />
        <View style={styles.tempBlock}>
          <Text style={styles.temp}>{station.temperatureC}°C</Text>
          <Text style={styles.description} numberOfLines={1}>
            {station.description || station.condition}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsRow}>
        <WeatherMetric label="SENSAÇÃO" value={`${station.feelsLikeC}°C`} styles={styles} />
        <WeatherMetric label="UMIDADE" value={`${station.humidity}%`} styles={styles} />
        <WeatherMetric label="VENTO" value={`${station.windSpeedMs.toFixed(1)} m/s`} styles={styles} />
        <WeatherMetric label="PRESSÃO" value={`${station.pressure} hPa`} styles={styles} />
      </View>
    </>
  );
}

interface WidgetCardProps {
  children: ReactNode;
  styles: Styles;
}

function WidgetCard({ children, styles }: WidgetCardProps) {
  return <View style={styles.card}>{children}</View>;
}

/**
 * Painel das condições da base de lançamento (Cape Canaveral por padrão).
 * Consome `useWeather` e trata os três estados: skeleton no carregamento, erro
 * compacto com retry e a telemetria atmosférica normalizada no sucesso.
 */
export default function WeatherWidget() {
  const { data, loading, error, reload } = useWeather();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <WidgetCard styles={styles}>
      <View style={styles.header}>
        <Text style={styles.title}>BASE DE LANÇAMENTO</Text>
        {data ? (
          <Text style={styles.location} numberOfLines={1}>
            {data.location} · {data.country}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <SkeletonLoader height={96} />
      ) : error ? (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons name="weather-cloudy-alert" size={28} color={colors.danger} />
          <Text style={styles.errorMessage} numberOfLines={2}>
            Sinal meteorológico indisponível.
          </Text>
          <Pressable
            onPress={reload}
            accessibilityRole="button"
            accessibilityLabel="Recarregar clima da base"
            style={({ pressed }) => [styles.retry, pressed ? styles.retryPressed : null]}
          >
            <MaterialCommunityIcons name="reload" size={14} color={colors.accent} />
            <Text style={styles.retryLabel}>RECARREGAR</Text>
          </Pressable>
        </View>
      ) : data ? (
        <WeatherBody station={data} styles={styles} accent={colors.accent} />
      ) : null}
    </WidgetCard>
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
      gap: spacing.sm,
    },
    title: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
    },
    location: {
      flexShrink: 1,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      letterSpacing: letterSpacing.wide,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    tempBlock: {
      flex: 1,
    },
    temp: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
    },
    description: {
      fontFamily: fontFamily.sans,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textTransform: 'capitalize',
      marginTop: spacing.xs / 2,
    },
    divider: {
      height: borderWidth.hairline,
      backgroundColor: colors.border,
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
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    errorMessage: {
      flex: 1,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      color: colors.textMuted,
    },
    retry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.accent,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    retryPressed: {
      opacity: 0.7,
    },
    retryLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.accent,
      letterSpacing: letterSpacing.wide,
    },
  });
