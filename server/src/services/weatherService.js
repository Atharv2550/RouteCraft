import { logger } from '../utils/logger.js';

// Weather code description mapping for Open-Meteo WMO weather interpretation codes
const weatherCodeMap = {
  0: { condition: 'Clear Sky', icon: '☀️' },
  1: { condition: 'Mainly Clear', icon: '🌤️' },
  2: { condition: 'Partly Cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Depositing Rime Fog', icon: '🌫️' },
  51: { condition: 'Light Drizzle', icon: '🌦️' },
  53: { condition: 'Moderate Drizzle', icon: '🌧️' },
  55: { condition: 'Dense Drizzle', icon: '🌧️' },
  61: { condition: 'Slight Rain', icon: '🌦️' },
  63: { condition: 'Moderate Rain', icon: '🌧️' },
  65: { condition: 'Heavy Rain', icon: '🌧️' },
  71: { condition: 'Slight Snow Fall', icon: '🌨️' },
  73: { condition: 'Moderate Snow Fall', icon: '🌨️' },
  75: { condition: 'Heavy Snow Fall', icon: '❄️' },
  80: { condition: 'Rain Showers', icon: '🌦️' },
  81: { condition: 'Heavy Rain Showers', icon: '🌧️' },
  82: { condition: 'Violent Rain Showers', icon: '⛈️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm with Hail', icon: '⛈️' }
};

export async function fetchWeatherForecast(latitude, longitude) {
  if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
    return {
      available: false,
      reason: 'Valid coordinates are required to retrieve weather forecast'
    };
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

    // Fetch with 4 second timeout so it never blocks requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      logger.warn(`Weather service response not OK: ${res.statusText}`);
      return {
        available: false,
        reason: 'Weather service currently unavailable'
      };
    }

    const data = await res.json();
    if (!data.daily || !data.daily.time) {
      return {
        available: false,
        reason: 'No forecast data returned by provider'
      };
    }

    const forecast = data.daily.time.map((date, idx) => {
      const code = data.daily.weathercode ? data.daily.weathercode[idx] : 0;
      const codeInfo = weatherCodeMap[code] || { condition: 'Partly Cloudy', icon: '⛅' };

      return {
        date,
        tempMax: Math.round(data.daily.temperature_2m_max ? data.daily.temperature_2m_max[idx] : 20),
        tempMin: Math.round(data.daily.temperature_2m_min ? data.daily.temperature_2m_min[idx] : 12),
        precipitationProb: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[idx] : 0,
        condition: codeInfo.condition,
        icon: codeInfo.icon
      };
    });

    return {
      available: true,
      provider: 'Open-Meteo',
      updatedAt: new Date().toISOString(),
      forecast
    };
  } catch (err) {
    logger.warn(`Weather service fetch error: ${err.message}`);
    return {
      available: false,
      reason: 'Weather provider temporarily unreachable',
      error: err.message
    };
  }
}
