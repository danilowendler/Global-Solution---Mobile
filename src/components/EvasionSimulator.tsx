import { useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import Badge from './Badge';
import {
  DELTA_V_DEFAULT_MS,
  DELTA_V_MAX_MS,
  DELTA_V_MIN_MS,
  DELTA_V_STEP_MS,
  LEAD_TIME_DEFAULT_MIN,
  LEAD_TIME_PRESETS_MIN,
  leadLabel,
  simulateEvasion,
} from '../utils/evasion';

interface EvasionSimulatorProps {
  alert: DebrisAlert;
}

/** Duração legível para a antecedência mínima — `2h47` / `45min`. */
function formatLead(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

/**
 * Simulador de janela de evasão. O operador escolhe QUANDO agir (chips de
 * antecedência) e o IMPULSO Δv (stepper); o painel recalcula a separação
 * projetada contra o corredor de varredura e emite o veredito. Estado de
 * interação é local — a matemática vive em `utils/evasion.ts`.
 */
export default function EvasionSimulator({ alert }: EvasionSimulatorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [leadTimeMinutes, setLeadTimeMinutes] = useState(LEAD_TIME_DEFAULT_MIN);
  const [deltaVMs, setDeltaVMs] = useState(DELTA_V_DEFAULT_MS);

  const result = useMemo(
    () => simulateEvasion({ tcaMinutes: alert.tcaMinutes, leadTimeMinutes, deltaVMs }),
    [alert.tcaMinutes, leadTimeMinutes, deltaVMs],
  );

  const decDisabled = deltaVMs <= DELTA_V_MIN_MS;
  const incDisabled = deltaVMs >= DELTA_V_MAX_MS;
  const verdictColor = result.feasible ? colors.success : colors.danger;

  const hint = result.windowClosed
    ? 'Janela de manobra encerrada — TCA atingido.'
    : result.feasible
      ? 'Manobra esvazia o corredor de varredura.'
      : result.minLeadMinutes !== null
        ? `Antecedência mínima p/ este Δv: ${formatLead(result.minLeadMinutes)}. Faltam ${result.deficitKm.toFixed(2)} km.`
        : `Nem agir agora esvazia o corredor — aumente o Δv. Faltam ${result.deficitKm.toFixed(2)} km.`;

  const capped = !result.windowClosed && result.effectiveLeadMinutes < leadTimeMinutes;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIMULADOR DE EVASÃO</Text>

      <Text style={styles.label}>AGIR EM</Text>
      <View style={styles.chipsRow}>
        {LEAD_TIME_PRESETS_MIN.map((preset) => {
          const active = preset === leadTimeMinutes;
          // Excede a janela: não dá para agir antes do instante atual. Esmaecemos
          // como sinal — o cálculo cap a antecedência e a nota explica.
          const beyondWindow = preset > alert.tcaMinutes;
          return (
            <Pressable
              key={preset}
              onPress={() => setLeadTimeMinutes(preset)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Agir em ${leadLabel(preset)}`}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : null,
                beyondWindow && !active ? styles.chipBeyond : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                {leadLabel(preset)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>IMPULSO Δv</Text>
      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => setDeltaVMs((v) => round1(Math.max(DELTA_V_MIN_MS, v - DELTA_V_STEP_MS)))}
          disabled={decDisabled}
          accessibilityRole="button"
          accessibilityLabel="Diminuir impulso"
          style={({ pressed }) => [
            styles.stepBtn,
            decDisabled ? styles.stepBtnDisabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <MaterialCommunityIcons name="minus" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.deltaValue}>{deltaVMs.toFixed(1)} m/s</Text>
        <Pressable
          onPress={() => setDeltaVMs((v) => round1(Math.min(DELTA_V_MAX_MS, v + DELTA_V_STEP_MS)))}
          disabled={incDisabled}
          accessibilityRole="button"
          accessibilityLabel="Aumentar impulso"
          style={({ pressed }) => [
            styles.stepBtn,
            incDisabled ? styles.stepBtnDisabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.readoutRow}>
        <Text style={styles.readoutLabel}>SEPARAÇÃO PROJETADA</Text>
        <Text style={[styles.readoutValue, { color: verdictColor }]}>
          {result.gainedSeparationKm.toFixed(2)} km
        </Text>
      </View>
      <View style={styles.readoutRow}>
        <Text style={styles.readoutLabel}>CORREDOR DE SEGURANÇA</Text>
        <Text style={styles.readoutValue}>{result.requiredClearanceKm.toFixed(2)} km</Text>
      </View>
      {capped ? (
        <Text style={styles.cappedNote}>
          Janela real: {formatLead(result.effectiveLeadMinutes)} (limite até o TCA)
        </Text>
      ) : null}

      <View style={styles.verdictRow}>
        <Badge
          label={result.feasible ? 'VIÁVEL' : 'INSUFICIENTE'}
          color={verdictColor}
        />
        <Text style={styles.hint}>{hint}</Text>
      </View>
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
    label: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
      marginTop: spacing.xs,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      borderColor: colors.accent,
      backgroundColor: `${colors.accent}1A`,
    },
    chipBeyond: {
      opacity: 0.4,
    },
    chipText: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      letterSpacing: letterSpacing.wide,
    },
    chipTextActive: {
      color: colors.accent,
      fontWeight: fontWeight.bold,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    stepBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnDisabled: {
      opacity: 0.35,
    },
    deltaValue: {
      minWidth: 96,
      textAlign: 'center',
      fontFamily: fontFamily.mono,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
    },
    pressed: {
      opacity: 0.6,
    },
    divider: {
      height: borderWidth.hairline,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
    readoutRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    readoutLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    readoutValue: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
    },
    cappedNote: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.accentAmber,
    },
    verdictRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    hint: {
      flex: 1,
      fontFamily: fontFamily.sans,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
  });
