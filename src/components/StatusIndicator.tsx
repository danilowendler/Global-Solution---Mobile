import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { fontFamily, fontSize, letterSpacing, spacing } from '../theme';
import { useTheme } from '../hooks/useTheme';

interface StatusIndicatorProps {
  /** Cor do ponto. Default: acento ativo do tema. */
  color?: string;
  label?: string;
  /** Ativa o pulso de opacidade/escala (estados live/críticos). */
  pulse?: boolean;
  size?: number;
  style?: ViewStyle;
}

/**
 * Ponto de status com pulso opcional via Animated API nativa — usado para
 * sinalizar feed ativo ("LIVE") e severidade crítica nos cards.
 */
export default function StatusIndicator({
  color,
  label,
  pulse = false,
  size = 8,
  style,
}: StatusIndicatorProps) {
  const { colors } = useTheme();
  const dotColor = color ?? colors.accent;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, pulse]);

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: dotColor,
    opacity: pulse ? anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) : 1,
    transform: pulse
      ? [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }]
      : [],
  };

  return (
    <View style={[styles.row, style]}>
      <Animated.View style={dotStyle} />
      {label ? <Animated.Text style={[styles.label, { color: dotColor }]}>{label}</Animated.Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
});
