interface WeatherDescription {
  description: string;
  icon: string;
}

const weatherCodes: Record<number, WeatherDescription> = {
  0: { description: 'Céu limpo', icon: '☀️' },
  1: { description: 'Predominantemente limpo', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Nevoeiro', icon: '🌫️' },
  48: { description: 'Nevoeiro com geada', icon: '🌫️' },
  51: { description: 'Garoa fraca', icon: '🌧️' },
  53: { description: 'Garoa moderada', icon: '🌧️' },
  55: { description: 'Garoa intensa', icon: '🌧️' },
  56: { description: 'Garoa congelante fraca', icon: '🌧️' },
  57: { description: 'Garoa congelante intensa', icon: '🌧️' },
  61: { description: 'Chuva fraca', icon: '🌧️' },
  63: { description: 'Chuva moderada', icon: '🌧️' },
  65: { description: 'Chuva intensa', icon: '🌧️' },
  66: { description: 'Chuva congelante fraca', icon: '🌧️' },
  67: { description: 'Chuva congelante intensa', icon: '🌧️' },
  71: { description: 'Neve fraca', icon: '🌨️' },
  73: { description: 'Neve moderada', icon: '🌨️' },
  75: { description: 'Neve intensa', icon: '🌨️' },
  77: { description: 'Grãos de neve', icon: '🌨️' },
  80: { description: 'Pancadas de chuva fracas', icon: '🌦️' },
  81: { description: 'Pancadas de chuva moderadas', icon: '🌦️' },
  82: { description: 'Pancadas de chuva fortes', icon: '🌧️' },
  85: { description: 'Pancadas de neve fracas', icon: '🌨️' },
  86: { description: 'Pancadas de neve fortes', icon: '🌨️' },
  95: { description: 'Trovoada', icon: '⛈️' },
  96: { description: 'Trovoada com granizo fraco', icon: '⛈️' },
  99: { description: 'Trovoada com granizo forte', icon: '⛈️' },
};

const unavailable: WeatherDescription = { description: 'Dado indisponível', icon: '❔' };

export function getWeatherDescription(code: number | null | undefined): WeatherDescription {
  return code == null || !Number.isFinite(code) ? unavailable : (weatherCodes[code] ?? unavailable);
}
