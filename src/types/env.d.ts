/**
 * Tipagem das variáveis de ambiente expostas ao bundle pelo Expo (SDK 55).
 *
 * Apenas variáveis com o prefixo `EXPO_PUBLIC_` são injetadas em `process.env`
 * pelo Metro. Declará-las aqui mantém o acesso a `process.env.*` sob `strict`
 * sem recorrer a `any`.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_NASA_KEY: string;
    readonly EXPO_PUBLIC_WEATHER_KEY: string;
  }
}
