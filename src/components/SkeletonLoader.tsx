import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, type DimensionValue, type ViewStyle } from 'react-native';
import { radius as radiusTokens, type Palette } from '../theme';
import { useTheme } from '../hooks/useTheme';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Placeholder de carregamento. Usa exclusivamente a Animated API nativa do RN
 * (sem Reanimated): um loop suave de opacidade que comunica "carregando" sem
 * decoração excessiva — coerente com o tom tático.
 */
export default function SkeletonLoader({
  width = '100%',
  height = 16,
  radius = radiusTokens.sm,
  style,
}: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surfaceElevated,
    },
  });
