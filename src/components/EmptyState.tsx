import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, fontSize, fontWeight, letterSpacing, spacing, type Palette } from '../theme';
import { useTheme } from '../hooks/useTheme';

interface EmptyStateProps {
  /** Ícone do conjunto MaterialCommunityIcons. */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message?: string;
}

/** Estado vazio padronizado — sem dados a exibir, sem erro. */
export default function EmptyState({ icon = 'radar', title, message }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    title: {
      fontFamily: fontFamily.sans,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.textSecondary,
      letterSpacing: letterSpacing.wide,
      textAlign: 'center',
    },
    message: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 280,
    },
  });
