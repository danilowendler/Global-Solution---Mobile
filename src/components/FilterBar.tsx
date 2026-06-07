import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { RiskLevel } from '../types/telemetry';
import { riskColor } from '../utils/risk';

/** `all` = sem filtro; demais valores filtram por nível de risco. */
export type RiskFilter = RiskLevel | 'all';
/** Direção de ordenação por TCA (tempo até a aproximação máxima). */
export type SortDirection = 'asc' | 'desc';

interface FilterBarProps {
  activeRisk: RiskFilter;
  onRiskChange: (risk: RiskFilter) => void;
  sortDir: SortDirection;
  onToggleSort: () => void;
}

const RISK_OPTIONS: ReadonlyArray<{ value: RiskFilter; label: string }> = [
  { value: 'all', label: 'TODOS' },
  { value: 'critical', label: 'CRÍTICO' },
  { value: 'high', label: 'ALTO' },
  { value: 'moderate', label: 'MODERADO' },
  { value: 'nominal', label: 'NOMINAL' },
];

/**
 * Controles táticos da Listagens: filtro por severidade (chips) e ordenação por
 * TCA. Componente controlado — toda a derivação da lista vive na tela; aqui só
 * apresentamos estado e despachamos intenções.
 */
export default function FilterBar({
  activeRisk,
  onRiskChange,
  sortDir,
  onToggleSort,
}: FilterBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const chipColor = (value: RiskFilter): string =>
    value === 'all' ? colors.accent : riskColor(value);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {RISK_OPTIONS.map(({ value, label }) => {
          const active = activeRisk === value;
          const accent = chipColor(value);
          return (
            <Pressable
              key={value}
              onPress={() => onRiskChange(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active ? { borderColor: accent, backgroundColor: `${accent}1f` } : null]}
            >
              <Text style={[styles.chipLabel, active ? { color: accent } : null]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={onToggleSort}
        accessibilityRole="button"
        accessibilityLabel="Alternar ordenação por TCA"
        style={({ pressed }) => [styles.sort, pressed ? styles.sortPressed : null]}
      >
        <MaterialCommunityIcons
          name={sortDir === 'asc' ? 'sort-clock-ascending-outline' : 'sort-clock-descending-outline'}
          size={16}
          color={colors.accent}
        />
        <Text style={styles.sortLabel}>TCA {sortDir === 'asc' ? '↑' : '↓'}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    chipRow: {
      gap: spacing.sm,
      paddingRight: spacing.lg,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    sort: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
    },
    sortPressed: {
      opacity: 0.7,
    },
    sortLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.accent,
      letterSpacing: letterSpacing.wide,
    },
  });
