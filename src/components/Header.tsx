import { useMemo, type ReactNode } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  borderWidth,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  spacing,
  type Palette,
} from '../theme';
import { useTheme } from '../hooks/useTheme';
import StatusIndicator from './StatusIndicator';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Slot à direita (ações, métricas). Sobrepõe o indicador "LIVE" padrão. */
  right?: ReactNode;
  /** Mostra o indicador "LIVE" pulsante quando não há slot custom. Default: true. */
  live?: boolean;
  /** Quando definido, exibe um botão de voltar à esquerda da marca (telas de stack). */
  onBack?: () => void;
}

/**
 * Cabeçalho tático padronizado. Aplica a safe-area superior e exibe a marca
 * ARGUS + título da seção, com um indicador de feed ativo.
 */
export default function Header({ title, subtitle, right, live = true, onBack }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={spacing.sm}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={({ pressed }) => (pressed ? styles.backPressed : null)}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color={colors.accent} />
            </Pressable>
          ) : null}
          <Text style={styles.brand}>ARGUS</Text>
        </View>
        {right ?? (live ? <StatusIndicator color={colors.success} label="LIVE" pulse /> : null)}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: borderWidth.hairline,
      borderBottomColor: colors.border,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    backPressed: {
      opacity: 0.6,
    },
    brand: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.accent,
      letterSpacing: letterSpacing.wider,
    },
    title: {
      fontFamily: fontFamily.sans,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      letterSpacing: letterSpacing.wide,
      marginTop: spacing.sm,
    },
    subtitle: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });
