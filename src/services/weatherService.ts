import { createHttpClient } from './http';
import type { WeatherResponse } from '../types/api';
import type { StationWeather } from '../types/weather';

const weatherHttp = createHttpClient('https://api.openweathermap.org');

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY;

/** Consulta por cidade (`q`) ou por coordenadas (`lat`/`lon`). */
export type WeatherQuery = { city: string } | { lat: number; lon: number };

/** Estação de referência padrão: Cape Canaveral (Kennedy Space Center). */
const DEFAULT_QUERY: WeatherQuery = { city: 'Cape Canaveral' };

function toRequestParams(query: WeatherQuery): Record<string, string | number> {
  const base = {
    units: 'metric',
    lang: 'pt_br',
    appid: WEATHER_API_KEY,
  };
  return 'city' in query
    ? { ...base, q: query.city }
    : { ...base, lat: query.lat, lon: query.lon };
}

function mapWeather(res: WeatherResponse): StationWeather {
  const condition = res.weather[0];

  return {
    location: res.name,
    country: res.sys.country ?? '—',
    temperatureC: Math.round(res.main.temp),
    feelsLikeC: Math.round(res.main.feels_like),
    humidity: res.main.humidity,
    pressure: res.main.pressure,
    windSpeedMs: res.wind.speed,
    condition: condition?.main ?? 'Desconhecido',
    description: condition?.description ?? '',
    icon: condition?.icon ?? '01d',
    observedAt: res.dt * 1_000,
    coord: { lat: res.coord.lat, lon: res.coord.lon },
  };
}

/**
 * Busca o clima atual de uma estação/local e normaliza para `StationWeather`.
 * Erros (incluindo chave ausente/inválida) chegam como `AppError` via interceptor
 * e são apenas propagados para o hook.
 */
export async function fetchStationWeather(
  query: WeatherQuery = DEFAULT_QUERY,
): Promise<StationWeather> {
  const { data } = await weatherHttp.get<WeatherResponse>('/data/2.5/weather', {
    params: toRequestParams(query),
  });

  return mapWeather(data);
}
