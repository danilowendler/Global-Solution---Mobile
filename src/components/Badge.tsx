import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { borderWidth, fontFamily, fontSize, fontWeight, letterSpacing, radius, spacing } from '../theme';

interface BadgeProps {
  label: string;
  /** Cor de destaque (texto + borda + fundo translúcido). */
  color: string;
  style?: ViewStyle;
}

/** Pill compacto e monoespaçado para severidade/status. */
export default function Badge({ label, color, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}1A` }, style]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
  },
  label: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wide,
  },
});
