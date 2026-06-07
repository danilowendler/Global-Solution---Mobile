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

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface MetricTileProps {
  label: string;
  value: string;
  /** Cor de destaque do valor e do ícone. Default: acento do tema (dado ativo). */
  accent?: string;
  icon?: IconName;
}

/**
 * Indicador numérico compacto do resumo de alvos. Apenas apresentação: recebe o
 * valor já formatado e a cor semântica, sem derivar nada.
 */
export default function MetricTile({ label, value, accent, icon }: MetricTileProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const accentColor = accent ?? colors.accent;

  return (
    <View style={styles.tile}>
      <View style={styles.labelRow}>
        {icon ? <MaterialCommunityIcons name={icon} size={13} color={colors.textMuted} /> : null}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { color: accentColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    tile: {
      flexGrow: 1,
      flexBasis: 140,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    label: {
      flexShrink: 1,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    value: {
      flexShrink: 1,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
    },
  });
