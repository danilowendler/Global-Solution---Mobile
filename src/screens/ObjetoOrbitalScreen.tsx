import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RootStackScreenProps } from '../types/navigation';
import {
  ApproachGeometry,
  Badge,
  EvasionSimulator,
  Header,
  MetricTile,
  Screen,
  StatusIndicator,
} from '../components';
import { useTheme } from '../hooks/useTheme';
import { useCountdown } from '../hooks/useCountdown';
import { riskColor, riskLabel } from '../utils/risk';
import { fontFamily, fontSize, fontWeight, letterSpacing, spacing, type Palette } from '../theme';

/**
 * Painel de Conjunção — detalhe de um alerta de aproximação. Recebe o snapshot
 * completo do `DebrisAlert` pela rota (autossuficiente). Orquestra: contagem viva
 * até o TCA, telemetria, geometria de aproximação e o simulador de evasão.
 */
export default function ObjetoOrbitalScreen({
  route,
  navigation,
}: RootStackScreenProps<'ObjetoOrbital'>) {
  const { alert } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const color = riskColor(alert.risk);
  const isCritical = alert.risk === 'critical';

  // Alvo da contagem = agora + TCA. Fixado por montagem (o TCA não muda na tela).
  const targetMs = useMemo(() => Date.now() + alert.tcaMinutes * 60_000, [alert.tcaMinutes]);
  const { hms, expired } = useCountdown(targetMs);

  return (
    <View style={styles.root}>
      <Header
        title={`NORAD ${alert.noradId}`}
        subtitle={alert.designation}
        onBack={() => navigation.goBack()}
        right={<Badge label={riskLabel(alert.risk)} color={color} />}
      />

      <Screen scroll>
        <View style={styles.tcaBlock}>
          <View style={styles.tcaHeader}>
            <Text style={styles.kicker}>TEMPO ATÉ APROX. MÁXIMA · TCA</Text>
            {isCritical ? <StatusIndicator color={color} pulse size={8} /> : null}
          </View>
          <Text style={[styles.countdown, { color: expired ? colors.textMuted : color }]}>
            {expired ? 'APROX. MÁX. ATINGIDA' : hms}
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <MetricTile
            label="MISS"
            value={`${alert.missDistanceKm.toFixed(0)} km`}
            icon="arrow-expand-horizontal"
          />
          <MetricTile
            label="Pc"
            value={`${(alert.collisionProbability * 100).toFixed(3)}%`}
            accent={colors.accentAmber}
            icon="percent"
          />
          <MetricTile label="ALT" value={`${alert.altitudeKm} km`} icon="altimeter" />
          <MetricTile label="RISCO" value={riskLabel(alert.risk)} accent={color} icon="alert-outline" />
        </View>

        <View style={styles.block}>
          <ApproachGeometry alert={alert} />
        </View>

        <View style={styles.block}>
          <EvasionSimulator alert={alert} />
        </View>
      </Screen>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tcaBlock: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    tcaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kicker: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
    },
    countdown: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.wide,
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
  });
