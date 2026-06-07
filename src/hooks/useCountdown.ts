import { useEffect, useState } from 'react';

export interface Countdown {
  /** Tempo restante formatado `HH:MM:SS` (`00:00:00` quando expirado). */
  hms: string;
  /** O alvo já foi atingido/ultrapassado. */
  expired: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Conta o tempo restante até `targetMs` (epoch). Cada tique recalcula a partir de
 * `Date.now()` (nunca decrementa um acumulador) e re-agenda alinhado à próxima
 * virada de segundo do relógio — o display permanece fiel mesmo após throttling de
 * timers (ex.: aba em background na web), sem drift. Encerra ao zerar e limpa o
 * timer no unmount/troca de alvo. Usado no Painel de Conjunção para o TCA vivo.
 */
export function useCountdown(targetMs: number): Countdown {
  const [remaining, setRemaining] = useState(() => targetMs - Date.now());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const next = targetMs - Date.now();
      setRemaining(next);
      if (next <= 0) return;
      timeoutId = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    tick();
    return () => clearTimeout(timeoutId);
  }, [targetMs]);

  return { hms: format(remaining), expired: remaining <= 0 };
}
