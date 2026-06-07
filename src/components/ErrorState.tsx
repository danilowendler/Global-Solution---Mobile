import { useMemo } from 'react';
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

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Estado de erro padronizado, com ação de retry opcional. */
export default function ErrorState({
  title = 'Falha na telemetria',
  message = 'Não foi possível obter os dados orbitais.',
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="alert-octagon-outline" size={48} color={colors.danger} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retry, pressed ? styles.retryPressed : null]}
        >
          <MaterialCommunityIcons name="reload" size={16} color={colors.accent} />
          <Text style={styles.retryLabel}>TENTAR NOVAMENTE</Text>
        </Pressable>
      ) : null}
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
      color: colors.textPrimary,
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
    retry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.accent,
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
