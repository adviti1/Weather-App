
export enum WeatherCondition {
  Clear = 'Clear',
  Cloudy = 'Cloudy',
  Rainy = 'Rainy',
  Snowy = 'Snowy',
  Thunderstorm = 'Thunderstorm',
  Unknown = 'Unknown'
}

export interface CurrentWeather {
  city: string;
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  description: string;
  iconCode: number;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: WeatherCondition;
  iconCode: number;
}

export interface CityWeatherSummary {
  id: string;
  name: string;
  country: string;
  temp: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
}

export type Unit = 'C' | 'F';
export type Theme = 'light' | 'dark';
