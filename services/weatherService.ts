
import { WeatherCondition, CurrentWeather, ForecastDay } from '../types';

const mapWeatherCodeToCondition = (code: number): WeatherCondition => {
  if (code === 0) return WeatherCondition.Clear;
  if (code >= 1 && code <= 3) return WeatherCondition.Cloudy;
  if (code >= 45 && code <= 67) return WeatherCondition.Rainy;
  if (code >= 71 && code <= 77) return WeatherCondition.Snowy;
  if (code >= 80 && code <= 99) return WeatherCondition.Thunderstorm;
  return WeatherCondition.Unknown;
};

export const fetchGeocoding = async (city: string) => {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) throw new Error("City not found");
  return data.results[0];
};

export const fetchWeatherData = async (lat: number, lon: number, cityName: string): Promise<{ current: CurrentWeather; forecast: ForecastDay[] }> => {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
  const data = await response.json();

  const current: CurrentWeather = {
    city: cityName,
    temperature: data.current.temperature_2m,
    condition: mapWeatherCodeToCondition(data.current.weather_code),
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    description: "Current Conditions",
    iconCode: data.current.weather_code
  };

  const forecast: ForecastDay[] = data.daily.time.slice(0, 5).map((date: string, index: number) => ({
    date,
    maxTemp: data.daily.temperature_2m_max[index],
    minTemp: data.daily.temperature_2m_min[index],
    condition: mapWeatherCodeToCondition(data.daily.weather_code[index]),
    iconCode: data.daily.weather_code[index]
  }));

  return { current, forecast };
};
