import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  borderWidth,
  fontFamily,
  fontSize,
  radius,
  spacing,
  type Palette,
} from '../theme';
import { useTheme } from '../hooks/useTheme';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * Campo de busca tático e controlado. Apenas apresentação: o filtro real vive na
 * tela. Exibe um botão de limpar quando há texto.
 */
export default function SearchField({ value, onChangeText, placeholder = 'Buscar…' }: SearchFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar objetos rastreados"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.sm,
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      // Remove o contorno azul de foco padrão da versão web.
      ...Platform.select({ web: { outlineStyle: 'none' } as object, default: {} }),
    },
  });
