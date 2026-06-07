import { useMemo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, type Palette } from '../theme';
import { useTheme } from '../hooks/useTheme';

interface ScreenProps {
  children: ReactNode;
  /** Envolve o conteúdo em ScrollView (telas longas). Default: false. */
  scroll?: boolean;
  /** Remove o padding horizontal padrão (ex.: listas full-bleed). */
  noPadding?: boolean;
  contentStyle?: ViewStyle;
}

/**
 * Casca padrão de todas as telas: fundo base do tema + safe-area lateral e
 * inferior. O topo é deixado para o Header, que aplica a inset superior.
 */
export default function Screen({ children, scroll = false, noPadding = false, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const padding: ViewStyle = {
    paddingLeft: noPadding ? 0 : Math.max(spacing.lg, insets.left),
    paddingRight: noPadding ? 0 : Math.max(spacing.lg, insets.right),
    paddingBottom: insets.bottom,
  };

  if (scroll) {
    return (
      <View style={styles.root}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padding, { paddingBottom: insets.bottom + spacing.xxl }, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.root, padding, contentStyle]}>{children}</View>;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
  });
