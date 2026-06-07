/**
 * Contratos BRUTOS das APIs externas — refletem o JSON exatamente como cada
 * serviço entrega, inclusive os campos numéricos que a NASA serializa como
 * `string`. Estes tipos só circulam dentro de `src/services/`; a normalização
 * para o shape de domínio (`DebrisAlert`, `StationWeather`) acontece lá, de modo
 * que hooks e telas nunca enxergam estas interfaces.
 */

/* ---------------------------------------------------------------------------
 * NASA — Asteroids NeoWs (endpoint `feed`)
 * https://api.nasa.gov/neo/rest/v1/feed
 * ------------------------------------------------------------------------- */

export interface NasaNeoFeedResponse {
  element_count: number;
  /** Objetos agrupados por data (`YYYY-MM-DD`). */
  near_earth_objects: Record<string, NasaNeoObject[]>;
}

export interface NasaNeoObject {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: NasaEstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NasaCloseApproach[];
  is_sentry_object: boolean;
}

export interface NasaCloseApproach {
  close_approach_date: string;
  close_approach_date_full: string;
  /** Epoch (ms) da aproximação máxima. */
  epoch_date_close_approach: number;
  relative_velocity: NasaRelativeVelocity;
  miss_distance: NasaMissDistance;
  orbiting_body: string;
}

export interface NasaRelativeVelocity {
  kilometers_per_second: string;
  kilometers_per_hour: string;
  miles_per_hour: string;
}

export interface NasaMissDistance {
  astronomical: string;
  lunar: string;
  kilometers: string;
  miles: string;
}

export interface NasaEstimatedDiameter {
  kilometers: NasaDiameterRange;
  meters: NasaDiameterRange;
}

export interface NasaDiameterRange {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
}

/* ---------------------------------------------------------------------------
 * OpenWeather — Current Weather Data
 * https://api.openweathermap.org/data/2.5/weather
 * ------------------------------------------------------------------------- */

export interface WeatherResponse {
  coord: WeatherCoord;
  weather: WeatherCondition[];
  main: WeatherMain;
  wind: WeatherWind;
  clouds: WeatherClouds;
  visibility: number;
  dt: number;
  sys: WeatherSys;
  name: string;
  cod: number;
}

export interface WeatherCoord {
  lon: number;
  lat: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface WeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherClouds {
  all: number;
}

export interface WeatherSys {
  country?: string;
  sunrise?: number;
  sunset?: number;
}
