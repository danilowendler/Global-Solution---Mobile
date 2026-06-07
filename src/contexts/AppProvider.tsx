import { type ReactNode } from 'react';
import { FavoritesProvider } from './FavoritesContext';
import { TelemetryProvider } from './TelemetryContext';
import { ThemeProvider } from './ThemeContext';

/**
 * Compõe todos os provedores de estado global num único wrapper, mantendo o
 * `App.tsx` limpo e eliminando aninhamento manual / prop drilling. O
 * `ThemeProvider` fica na borda externa — toda a árvore (inclusive o roteador)
 * consome a paleta ativa.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <TelemetryProvider>{children}</TelemetryProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
