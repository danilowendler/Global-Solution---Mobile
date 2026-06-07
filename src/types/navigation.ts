import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DebrisAlert } from './telemetry';

/**
 * Abas principais do console Argus.
 * - Home: dashboard de monitoramento
 * - Listagens: Rastreio Orbital (detritos / objetos em LEO)
 * - Favoritos: Satélites Prioritários monitorados pelo operador
 * - Configuracoes: Sistemas (preferências, tema, etc.)
 */
export type TabParamList = {
  Home: undefined;
  Listagens: undefined;
  Favoritos: undefined;
  Configuracoes: undefined;
};

/**
 * Stack raiz. As abas vivem sob `Tabs`; o Painel de Conjunção (`ObjetoOrbital`)
 * é empilhado por cima ao tocar um alvo, carregando o snapshot completo do
 * `DebrisAlert` para ser autossuficiente (não depende do feed atual).
 */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  ObjetoOrbital: { alert: DebrisAlert };
};

/** Props tipadas para telas dentro do Stack raiz. */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/** Props tipadas para telas das abas (compostas com o Stack raiz). */
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

/**
 * Registro global de rotas para o React Navigation, garantindo que
 * `useNavigation()` seja tipado em todo o app sem casts manuais.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
