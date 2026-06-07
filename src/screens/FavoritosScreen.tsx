import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabScreenProps } from '../types/navigation';
import { EmptyState, Header, Screen, SkeletonLoader, TacticalCard } from '../components';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../hooks/useTheme';
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
import type { DebrisAlert } from '../types/telemetry';
import { riskColor } from '../utils/risk';

export default function FavoritosScreen({ navigation }: TabScreenProps<'Favoritos'>) {
  const insets = useSafeAreaInsets();
  const { favorites, recents, hydrated, isFavorite, toggleFavorite, clearRecents } = useFavorites();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const subtitle = !hydrated
    ? 'Carregando ativos salvos…'
    : `${favorites.length} ativo(s) sob monitoramento`;

  const recentsStrip =
    recents.length > 0 ? (
      <View style={styles.recents}>
        <View style={styles.recentsHeader}>
          <Text style={styles.sectionTitle}>ATIVIDADE RECENTE</Text>
          <Pressable
            onPress={clearRecents}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Limpar histórico recente"
          >
            <Text style={styles.clearLabel}>LIMPAR</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentsRow}
        >
          {recents.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => toggleFavorite(item)}
              accessibilityRole="button"
              accessibilityLabel={`Alternar ${item.designation} nos favoritos`}
              style={({ pressed }) => [styles.chip, pressed ? styles.chipPressed : null]}
            >
              <View style={[styles.chipAccent, { backgroundColor: riskColor(item.risk) }]} />
              <Text style={styles.chipText} numberOfLines={1}>
                {item.designation}
              </Text>
              <MaterialCommunityIcons
                name={isFavorite(item.id) ? 'star' : 'star-outline'}
                size={14}
                color={isFavorite(item.id) ? colors.accentAmber : colors.textMuted}
              />
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>PRIORITÁRIOS</Text>
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <Header title="Satélites Prioritários" subtitle={subtitle} live={false} />

      {!hydrated ? (
        <View style={styles.skeletons}>
          <SkeletonLoader height={108} />
          <SkeletonLoader height={108} />
        </View>
      ) : favorites.length === 0 && recents.length === 0 ? (
        <Screen>
          <EmptyState
            icon="star-outline"
            title="Nenhum ativo prioritário salvo"
            message="Marque objetos no Rastreio Orbital tocando na estrela para acompanhá-los aqui."
          />
        </Screen>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item: DebrisAlert) => item.id}
          ListHeaderComponent={recentsStrip}
          renderItem={({ item }) => (
            <TacticalCard
              alert={item}
              isFavorite
              onToggleFavorite={() => toggleFavorite(item)}
              onPress={() => navigation.navigate('ObjetoOrbital', { alert: item })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="star-outline"
              title="Nenhum ativo prioritário ativo"
              message="Toque na estrela de um objeto recente acima ou no Rastreio Orbital."
            />
          }
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skeletons: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.md,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.md,
    },
    recents: {
      gap: spacing.sm,
    },
    recentsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    recentsRow: {
      gap: spacing.sm,
      paddingBottom: spacing.xs,
    },
    sectionTitle: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.textMuted,
      letterSpacing: letterSpacing.wider,
      marginTop: spacing.sm,
    },
    clearLabel: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.accent,
      letterSpacing: letterSpacing.wide,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      maxWidth: 180,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
    },
    chipPressed: {
      opacity: 0.7,
    },
    chipAccent: {
      width: 6,
      height: 6,
      borderRadius: radius.pill,
    },
    chipText: {
      flexShrink: 1,
      fontFamily: fontFamily.sans,
      fontSize: fontSize.sm,
      color: colors.textPrimary,
    },
  });
