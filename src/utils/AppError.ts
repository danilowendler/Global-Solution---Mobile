import axios from 'axios';

/**
 * Categoria de falha já interpretada — a UI decide o que mostrar a partir daqui,
 * sem nunca precisar inspecionar `AxiosError` ou status HTTP cru.
 */
export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'client'
  | 'server'
  | 'unauthorized'
  | 'notFound'
  | 'rateLimit'
  | 'unknown';

interface AppErrorOptions {
  status?: number;
  cause?: unknown;
}

/**
 * Erro de domínio único do Argus. A Service Layer converte qualquer exceção
 * (Axios, rede, parsing) nesta classe antes de propagar, de modo que telas e
 * hooks lidem sempre com o mesmo contrato — `kind` + `message` legível.
 */
export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(kind: AppErrorKind, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = options.status;
    this.cause = options.cause;
    // Mantém a cadeia de protótipo correta ao estender Error sob target ES5/ES2015.
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /** Normaliza qualquer erro lançado por uma chamada Axios em um `AppError`. */
  static fromAxios(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return new AppError('timeout', 'Tempo de resposta excedido. Verifique a conexão.', {
          cause: error,
        });
      }

      const status = error.response?.status;
      if (status === undefined) {
        return new AppError('network', 'Falha de rede. Sem resposta do servidor.', {
          cause: error,
        });
      }

      return new AppError(kindFromStatus(status), messageFromStatus(status), {
        status,
        cause: error,
      });
    }

    const message = error instanceof Error ? error.message : 'Erro inesperado.';
    return new AppError('unknown', message, { cause: error });
  }
}

function kindFromStatus(status: number): AppErrorKind {
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimit';
  if (status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'unknown';
}

function messageFromStatus(status: number): string {
  switch (kindFromStatus(status)) {
    case 'unauthorized':
      return 'Acesso negado. Verifique a chave de API configurada.';
    case 'notFound':
      return 'Recurso não encontrado na fonte de telemetria.';
    case 'rateLimit':
      return 'Limite de requisições da API atingido. Tente novamente em instantes.';
    case 'server':
      return 'A fonte de telemetria está indisponível no momento.';
    case 'client':
      return 'Requisição inválida à fonte de telemetria.';
    default:
      return 'Erro inesperado ao consultar a telemetria.';
  }
}
