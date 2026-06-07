import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper tipado sobre o AsyncStorage. Toda I/O é encapsulada com falha
 * silenciosa: leituras corrompidas ou indisponíveis retornam `null` e escritas
 * que falham são engolidas, de modo que a camada de persistência nunca propaga
 * exceções para os contextos/telas. Serialização sempre via JSON.
 */

/** Chaves namespaced — fonte única, evita strings soltas espalhadas pelo app. */
export const STORAGE_KEYS = {
  favorites: '@argus/favorites',
  recents: '@argus/recents',
  theme: '@argus/theme',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Lê e desserializa um valor. Retorna `null` se ausente, corrompido ou em falha de I/O. */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Serializa e persiste um valor. Falhas são silenciosas (não bloqueiam a UI). */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistência best-effort: uma escrita falha não deve derrubar a sessão.
  }
}

/** Remove uma chave. Falhas são silenciosas. */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Idem setItem: best-effort.
  }
}
