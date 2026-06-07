import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TabScreenProps } from '../types/navigation';
import {
  EmptyState,
  ErrorState,
  Header,
  MetricTile,
  RiskChart,
  Screen,
  SkeletonLoader,
  TacticalCard,
  WeatherWidget,
} from '../components';
import { useTelemetry } from '../hooks/useTelemetry';
import { useTheme } from '../hooks/useTheme';
import { summarizeTelemetry } from '../utils/risk';
import { fontFamily, fontSize, fontWeight, letterSpacing, spacing, type Palette } from '../theme';

/** Quantos alvos de maior severidade destacar no painel (lista completa em Listagens). */
const PRIORITY_LIMIT = 3;

function formatTca(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m}`;
}

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { data, loading, error, reload } = useTelemetry();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const summary = useMemo(() => summarizeTelemetry(data), [data]);
  const priority = data.slice(0, PRIORITY_LIMIT);

  const subtitle = loading
    ? 'Sincronizando feed orbital…'
    : error
      ? 'Feed orbital indisponível'
      : `${summary.total} eventos · ${summary.critical} crítico(s)`;

  return (
    <View style={styles.root}>
      <Header title="Centro de Comando" subtitle={subtitle} live={!error} />

      {error ? (
        <Screen>
          <ErrorState message={error.message} onRetry={reload} />
        </Screen>
      ) : loading ? (
        <Screen scroll>
          <View style={styles.block}>
            <SkeletonLoader height={72} />
          </View>
          <View style={styles.block}>
            <SkeletonLoader height={196} />
          </View>
          <View style={styles.block}>
            <SkeletonLoader height={172} />
          </View>
        </Screen>
      ) : data.length === 0 ? (
        <Screen>
          <EmptyState
            icon="radar"
            title="Sem aproximações ativas"
            message="Nenhum objeto cruzando a janela orbital monitorada no momento."
          />
        </Screen>
      ) : (
        <Screen scroll>
          <View style={styles.metricsRow}>
            <MetricTile label="ALVOS" value={String(summary.total)} icon="satellite-variant" />
            <MetricTile
              label="CRÍTICOS"
              value={String(summary.critical)}
              accent={colors.danger}
              icon="alert-octagon-outline"
            />
            <MetricTile
              label="ALTO RISCO"
              value={String(summary.high)}
              accent={colors.accentAmber}
              icon="alert-outline"
            />
            <MetricTile
              label="PRÓX. TCA"
              value={formatTca(summary.nearestTcaMinutes)}
              icon="timer-outline"
            />
          </View>

          <View style={styles.block}>
            <RiskChart alerts={data} />
          </View>

          <View style={styles.block}>
            <WeatherWidget />
          </View>

          <Text style={styles.sectionTitle}>ALVOS PRIORITÁRIOS</Text>
          <View style={styles.list}>
            {priority.map((alert) => (
              <TacticalCard
                key={alert.id}
                alert={alert}
                onPress={() => navigation.navigate('ObjetoOrbital', { alert })}
              />
            ))}
          </View>
        </Screen>
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    metricsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    block: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    list: {
      gap: spacing.md,
    },
  });
