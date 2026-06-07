import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../storage';
import type { DebrisAlert } from '../types/telemetry';

/** Quantos objetos a trilha de atividade recente preserva. */
const RECENTS_CAP = 12;

/**
 * Ativos prioritários monitorados pelo operador. Persistimos o **snapshot
 * completo** do `DebrisAlert` (não apenas o id) para que a aba Favoritos funcione
 * de forma autossuficiente — sobrevive ao objeto sair do feed diário da NASA e
 * não exige uma nova busca para renderizar a telemetria salva.
 *
 * Mantemos também um **histórico recente** (`recents`): cada interação de
 * favoritar registra o objeto numa trilha de atividade capada, persistida à
 * parte, para o operador reencontrar rapidamente o que vinha acompanhando.
 */
export interface FavoritesContextValue {
  favorites: DebrisAlert[];
  /** Histórico de objetos interagidos recentemente (mais recente primeiro). */
  recents: DebrisAlert[];
  /** `false` até o estado ser carregado do disco — evita "piscar" o estado vazio. */
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  /** Adiciona se ausente, remove se presente. Registra em `recents` e persiste. */
  toggleFavorite: (alert: DebrisAlert) => void;
  /** Limpa a trilha de atividade recente. */
  clearRecents: () => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<DebrisAlert[]>([]);
  const [recents, setRecents] = useState<DebrisAlert[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hidratação no boot: carrega favoritos e histórico antes de liberar escrita.
  useEffect(() => {
    let active = true;
    Promise.all([
      getItem<DebrisAlert[]>(STORAGE_KEYS.favorites),
      getItem<DebrisAlert[]>(STORAGE_KEYS.recents),
    ]).then(([storedFavorites, storedRecents]) => {
      if (!active) return;
      if (storedFavorites) setFavorites(storedFavorites);
      if (storedRecents) setRecents(storedRecents);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persiste favoritos e histórico — guardado por `hydrated` para não sobrescrever
  // o disco com os arrays vazios iniciais antes da hidratação terminar.
  useEffect(() => {
    if (!hydrated) return;
    void setItem(STORAGE_KEYS.favorites, favorites);
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void setItem(STORAGE_KEYS.recents, recents);
  }, [recents, hydrated]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((alert) => alert.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback((alert: DebrisAlert) => {
    setFavorites((current) =>
      current.some((item) => item.id === alert.id)
        ? current.filter((item) => item.id !== alert.id)
        : [alert, ...current],
    );
    // Toda interação entra no topo do histórico (dedup por id, capado).
    setRecents((current) => [alert, ...current.filter((item) => item.id !== alert.id)].slice(0, RECENTS_CAP));
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  // Memoizado: sem isto, cada render recria o objeto e força re-render de todos
  // os consumidores (Home, Listagens, Favoritos), mesmo sem mudança de estado.
  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, recents, hydrated, isFavorite, toggleFavorite, clearRecents }),
    [favorites, recents, hydrated, isFavorite, toggleFavorite, clearRecents],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
