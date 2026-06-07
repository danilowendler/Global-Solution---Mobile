import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../contexts/ThemeContext';

/** Acessa o tema ativo (modo + paleta + toggle). Lança fora do `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme deve ser usado dentro de um <ThemeProvider>.');
  }
  return ctx;
}
