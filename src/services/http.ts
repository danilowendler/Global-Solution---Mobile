import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { AppError } from '../utils/AppError';

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Fábrica do cliente HTTP central do Argus. Cada API externa cria sua própria
 * instância com a `baseURL` adequada, mas todas compartilham a mesma política:
 * timeout, headers JSON e — crucialmente — os interceptors que normalizam erros.
 *
 * O interceptor de response garante que NENHUM `AxiosError` cru atravesse a
 * Service Layer: qualquer falha vira um `AppError` de domínio antes de chegar
 * aos serviços e hooks.
 */
export function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Ponto único para headers/credenciais comuns. A autenticação de cada API
    // é via query param (`api_key`/`appid`) no próprio serviço, então aqui só
    // reforçamos o Accept herdado da instância.
    config.headers.set('Accept', 'application/json');
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(AppError.fromAxios(error)),
  );

  return client;
}
