import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * Traduz o código de ícone do OpenWeather (`01d`…`50n`) para um glifo tático do
 * MaterialCommunityIcons. O prefixo de dois dígitos identifica a condição; o
 * sufixo `d`/`n` distingue dia de noite apenas para céu limpo/poucas nuvens.
 */
export function weatherIcon(code: string): IconName {
  const condition = code.slice(0, 2);
  const isNight = code.endsWith('n');

  switch (condition) {
    case '01':
      return isNight ? 'weather-night' : 'weather-sunny';
    case '02':
      return isNight ? 'weather-night-partly-cloudy' : 'weather-partly-cloudy';
    case '03':
      return 'weather-cloudy';
    case '04':
      return 'weather-cloudy';
    case '09':
      return 'weather-pouring';
    case '10':
      return 'weather-rainy';
    case '11':
      return 'weather-lightning';
    case '13':
      return 'weather-snowy';
    case '50':
      return 'weather-fog';
    default:
      return 'weather-cloudy';
  }
}
