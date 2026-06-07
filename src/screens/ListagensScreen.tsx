import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabScreenProps } from '../types/navigation';
import {
  EmptyState,
  ErrorState,
  FilterBar,
  Header,
  SearchField,
  SkeletonLoader,
  TacticalCard,
  type RiskFilter,
  type SortDirection,
} from '../components';
import { useTelemetry } from '../hooks/useTelemetry';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../hooks/useTheme';
import { spacing, type Palette } from '../theme';

export default function ListagensScreen({ navigation }: TabScreenProps<'Listagens'>) {
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useTelemetry();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const byRisk = riskFilter === 'all' ? data : data.filter((a) => a.risk === riskFilter);
    const byQuery = term
      ? byRisk.filter(
          (a) =>
            a.designation.toLowerCase().includes(term) || a.noradId.toLowerCase().includes(term),
        )
      : byRisk;
    return [...byQuery].sort((a, b) =>
      sortDir === 'asc' ? a.tcaMinutes - b.tcaMinutes : b.tcaMinutes - a.tcaMinutes,
    );
  }, [data, query, riskFilter, sortDir]);

  const searching = query.trim().length > 0;
  const subtitle = loading
    ? 'Carregando catálogo…'
    : error
      ? 'Catálogo indisponível'
      : searching
        ? `${visible.length} resultado(s) para "${query.trim()}"`
        : riskFilter === 'all'
          ? `Catálogo · ${data.length} objetos monitorados`
          : `${visible.length} de ${data.length} objetos`;

  return (
    <View style={styles.root}>
      <Header title="Rastreio Orbital" subtitle={subtitle} live={!error} />

      {error ? (
        <View style={styles.stateWrap}>
          <ErrorState message={error.message} onRetry={reload} />
        </View>
      ) : (
        <>
          <View style={styles.controls}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por designação ou NORAD…"
            />
            <FilterBar
              activeRisk={riskFilter}
              onRiskChange={setRiskFilter}
              sortDir={sortDir}
              onToggleSort={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}
            />
          </View>

          {loading ? (
            <View style={styles.skeletons}>
              <SkeletonLoader height={108} />
              <SkeletonLoader height={108} />
              <SkeletonLoader height={108} />
              <SkeletonLoader height={108} />
            </View>
          ) : (
            <FlatList
              data={visible}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TacticalCard
                  alert={item}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={() => toggleFavorite(item)}
                  onPress={() => navigation.navigate('ObjetoOrbital', { alert: item })}
                />
              )}
              ListEmptyComponent={
                searching ? (
                  <EmptyState
                    icon="magnify-close"
                    title="Nenhum objeto encontrado"
                    message={`Nada corresponde a "${query.trim()}". Revise o termo ou o filtro de risco.`}
                  />
                ) : (
                  <EmptyState
                    icon="filter-remove-outline"
                    title="Nenhum objeto neste filtro"
                    message="Ajuste o nível de risco para ver outros objetos rastreados."
                  />
                )
              }
              contentContainerStyle={[
                styles.content,
                visible.length === 0 ? styles.contentEmpty : null,
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
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
    controls: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.md,
    },
    skeletons: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    content: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    contentEmpty: {
      flexGrow: 1,
    },
    stateWrap: {
      flex: 1,
    },
  });
