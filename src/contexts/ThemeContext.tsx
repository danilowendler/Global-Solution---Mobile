import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { darkColors, lightColors, type Palette } from '../theme/colors';
import { getItem, setItem, STORAGE_KEYS } from '../storage';

export type ThemeMode = 'dark' | 'light';

/**
 * Tema ativo do console. Dark é o padrão (CLAUDE.md §2); o modo é persistido em
 * AsyncStorage e hidratado no boot. Toda a UI lê `colors` daqui — trocar o modo
 * repinta o app inteiro sem que nenhum componente guarde cor estática.
 */
export interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  /** `false` até o modo ser carregado do disco — evita "piscar" o tema errado. */
  hydrated: boolean;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [hydrated, setHydrated] = useState(false);

  // Hidrata o modo persistido antes de liberar a escrita.
  useEffect(() => {
    let active = true;
    getItem<ThemeMode>(STORAGE_KEYS.theme).then((stored) => {
      if (!active) return;
      if (stored === 'dark' || stored === 'light') setModeState(stored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persiste a cada troca, guardado por `hydrated` para não sobrescrever o disco
  // com o padrão inicial antes da hidratação terminar.
  useEffect(() => {
    if (!hydrated) return;
    void setItem(STORAGE_KEYS.theme, mode);
  }, [mode, hydrated]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const toggle = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      hydrated,
      toggle,
      setMode,
    }),
    [mode, hydrated, toggle, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
