import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TabScreenProps } from '../types/navigation';
import { Header, Screen } from '../components';
import { useTheme } from '../hooks/useTheme';
import type { ThemeMode } from '../contexts/ThemeContext';
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

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type Styles = ReturnType<typeof makeStyles>;

interface SettingRowProps {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
  styles: Styles;
  accent: string;
}

function SettingRow({ icon, label, value, last = false, styles, accent }: SettingRowProps) {
  return (
    <View style={[styles.row, last ? null : styles.rowDivider]}>
      <MaterialCommunityIcons name={icon} size={20} color={accent} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const THEME_SEGMENTS: ReadonlyArray<{ mode: ThemeMode; label: string; icon: IconName }> = [
  { mode: 'dark', label: 'TÁTICO', icon: 'weather-night' },
  { mode: 'light', label: 'CLARO', icon: 'weather-sunny' },
];

export default function ConfiguracoesScreen(_props: TabScreenProps<'Configuracoes'>) {
  const { mode, setMode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.root}>
      <Header title="Sistemas" subtitle="Configurações e preferências" live={false} />
      <Screen scroll>
        <Text style={styles.sectionTitle}>INTERFACE</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.rowDivider]}>
            <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.accent} />
            <Text style={styles.rowLabel}>Tema</Text>
            <View style={styles.toggle}>
              {THEME_SEGMENTS.map(({ mode: segment, label, icon }) => {
                const active = mode === segment;
                return (
                  <Pressable
                    key={segment}
                    onPress={() => setMode(segment)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Tema ${label}`}
                    style={[styles.segment, active ? styles.segmentActive : null]}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={13}
                      color={active ? colors.accent : colors.textMuted}
                    />
                    <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : null]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <SettingRow
            icon="bell-outline"
            label="Alertas"
            value="Ativados"
            last
            styles={styles}
            accent={colors.accent}
          />
        </View>

        <Text style={styles.sectionTitle}>SISTEMA</Text>
        <View style={styles.card}>
          <SettingRow
            icon="satellite-variant"
            label="Fonte de dados"
            value="NASA · OpenWeather"
            styles={styles}
            accent={colors.accent}
          />
          <SettingRow
            icon="information-outline"
            label="Versão"
            value="1.0.0"
            last
            styles={styles}
            accent={colors.accent}
          />
        </View>

        <Text style={styles.note}>
          A preferência de tema é salva no dispositivo (AsyncStorage) e restaurada no próximo boot.
        </Text>
      </Screen>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    rowDivider: {
      borderBottomWidth: borderWidth.hairline,
      borderBottomColor: colors.border,
    },
    rowLabel: {
      flex: 1,
      fontFamily: fontFamily.sans,
      fontSize: fontSize.md,
      color: colors.textPrimary,
    },
    rowValue: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    toggle: {
      flexDirection: 'row',
      borderRadius: radius.pill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    segment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    segmentActive: {
      backgroundColor: `${colors.accent}1f`,
    },
    segmentLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wide,
    },
    segmentLabelActive: {
      color: colors.accent,
    },
    note: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: spacing.lg,
      lineHeight: 18,
    },
  });
