import { useContext } from 'react';
import { FavoritesContext, type FavoritesContextValue } from '../contexts/FavoritesContext';

/** Acessa o estado de favoritos. Lança se usado fora do `FavoritesProvider`. */
export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (ctx === undefined) {
    throw new Error('useFavorites deve ser usado dentro de um <FavoritesProvider>.');
  }
  return ctx;
}
