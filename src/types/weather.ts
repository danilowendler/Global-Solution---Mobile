/**
 * Domínio climático consumido pela UI do Argus. A Service Layer normaliza a
 * resposta crua do OpenWeather (`WeatherResponse`) para este shape; telas e
 * hooks nunca veem o JSON original da API.
 */

/** Condições atmosféricas de uma estação/local de observação. */
export interface StationWeather {
  /** Nome do local (cidade/estação) reportado pela fonte. */
  location: string;
  /** Código do país (ISO-3166), quando disponível. */
  country: string;
  /** Temperatura atual, em °C. */
  temperatureC: number;
  /** Sensação térmica, em °C. */
  feelsLikeC: number;
  /** Umidade relativa, em %. */
  humidity: number;
  /** Pressão atmosférica, em hPa. */
  pressure: number;
  /** Velocidade do vento, em m/s. */
  windSpeedMs: number;
  /** Condição principal (ex.: "Clouds", "Clear"). */
  condition: string;
  /** Descrição localizada (ex.: "céu limpo"). */
  description: string;
  /** Código do ícone do OpenWeather (ex.: "01d"). */
  icon: string;
  /** Momento da medição (epoch em ms). */
  observedAt: number;
  /** Coordenadas geográficas da medição. */
  coord: {
    lat: number;
    lon: number;
  };
}
