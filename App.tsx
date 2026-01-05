
import React, { useState, useEffect, useCallback } from 'react';
import { CurrentWeather, ForecastDay, Unit, Theme, WeatherCondition } from './types';
import { fetchGeocoding, fetchWeatherData } from './services/weatherService';
import { WEATHER_ICONS } from './constants';
import { SkeletonCard, SkeletonForecast } from './components/SkeletonLoader';
import WeatherTable from './components/WeatherTable';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [search, setSearch] = useState('');
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>('C');
  const [theme, setTheme] = useState<Theme>('light');
  const [weatherAdvice, setWeatherAdvice] = useState<string>('Stay updated with SkyCast Pro. Check back regularly for high-precision real-time satellite data.');

  const generateAdvice = useCallback(async (weather: CurrentWeather) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Give a short, professional, and helpful weather tip for someone in ${weather.city} where the current weather is ${weather.condition}, ${weather.temperature}°C, ${weather.humidity}% humidity, and ${weather.windSpeed}km/h wind speed. Max 20 words.`,
        config: {
          systemInstruction: "You are a professional meteorologist giving concise, actionable weather advice.",
        }
      });
      if (response.text) {
        setWeatherAdvice(response.text.trim());
      }
    } catch (err) {
      console.error("Failed to generate weather advice:", err);
    }
  }, []);

  const handleSearch = useCallback(async (city: string) => {
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const location = await fetchGeocoding(city);
      const data = await fetchWeatherData(location.latitude, location.longitude, location.name);
      setCurrentWeather(data.current);
      setForecast(data.forecast);
    } catch (err: any) {
      setError(err.message || 'City not found. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationDetection = useCallback(() => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeatherData(latitude, longitude, "Your Location");
            setCurrentWeather(data.current);
            setForecast(data.forecast);
          } catch (err: any) {
            setError("Could not fetch weather for your location.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Location access denied.");
          setLoading(false);
          handleSearch('London');
        }
      );
    } else {
      handleSearch('London');
    }
  }, [handleSearch]);

  useEffect(() => {
    handleLocationDetection();
  }, []);

  useEffect(() => {
    if (currentWeather) {
      generateAdvice(currentWeather);
    }
  }, [currentWeather, generateAdvice]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const formatTemp = (celsius: number) => {
    if (unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const getGradientClass = (condition: WeatherCondition) => {
    switch (condition) {
      case WeatherCondition.Clear: return 'weather-gradient-clear';
      case WeatherCondition.Cloudy: return 'weather-gradient-cloudy';
      case WeatherCondition.Rainy: return 'weather-gradient-rainy';
      case WeatherCondition.Snowy: return 'weather-gradient-snow';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SkyCast <span className="text-indigo-600">Pro</span></h1>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
              className="p-3 glass-morphism rounded-xl hover:scale-105 transition-all font-bold w-12 text-center"
            >
              °{unit}
            </button>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-3 glass-morphism rounded-xl hover:scale-105 transition-all"
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative mb-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(search); }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search city (e.g., Tokyo, London)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl glass-morphism focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl transition-all dark:text-white"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1 transition-all"
            >
              Get Weather
            </button>
            <button 
              type="button"
              onClick={handleLocationDetection}
              className="glass-morphism py-4 px-4 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center"
              title="Detect Location"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </form>
          {error && <p className="absolute -bottom-6 left-0 text-red-500 text-sm font-medium">{error}</p>}
        </div>

        {/* Main Weather Card */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {loading ? <SkeletonCard /> : currentWeather && (
              <div className={`relative overflow-hidden p-8 rounded-[2rem] text-white shadow-2xl ${getGradientClass(currentWeather.condition)}`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-4xl font-extrabold mb-1 drop-shadow-md">{currentWeather.city}</h2>
                      <p className="text-lg opacity-90 drop-shadow-md">Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      {WEATHER_ICONS[currentWeather.condition]}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-baseline gap-4">
                    <span className="text-8xl font-black drop-shadow-2xl">{formatTemp(currentWeather.temperature)}°</span>
                    <span className="text-3xl font-medium opacity-80">{currentWeather.condition}</span>
                  </div>

                  <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
                    <div className="text-center">
                      <p className="text-sm uppercase tracking-wider opacity-60 mb-1">Humidity</p>
                      <p className="text-xl font-bold">{currentWeather.humidity}%</p>
                    </div>
                    <div className="text-center border-x border-white/20">
                      <p className="text-sm uppercase tracking-wider opacity-60 mb-1">Wind</p>
                      <p className="text-xl font-bold">{currentWeather.windSpeed} km/h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm uppercase tracking-wider opacity-60 mb-1">Feels Like</p>
                      <p className="text-xl font-bold">{formatTemp(currentWeather.temperature - 1)}°</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              </div>
            )}

            {/* 5-Day Forecast */}
            <section>
              <h3 className="text-2xl font-bold mb-6 px-2">5-Day Forecast</h3>
              {loading ? <SkeletonForecast /> : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {forecast.map((day, idx) => (
                    <div key={idx} className="glass-morphism p-4 rounded-3xl text-center flex flex-col items-center hover:scale-105 transition-all">
                      <p className="font-semibold text-sm mb-3">
                        {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="mb-3 bg-white/10 p-2 rounded-xl">
                        {WEATHER_ICONS[day.condition]}
                      </div>
                      <p className="text-lg font-bold">{formatTemp(day.maxTemp)}°</p>
                      <p className="text-sm opacity-50">{formatTemp(day.minTemp)}°</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar / Table */}
          <div className="lg:col-span-1">
            <div className="p-6 glass-morphism rounded-3xl shadow-lg border border-indigo-500/20 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                <h4 className="font-bold text-lg text-indigo-500">Meteorologist Tip</h4>
              </div>
              <p className="text-sm opacity-80 leading-relaxed italic">
                "{weatherAdvice}"
              </p>
            </div>
            <WeatherTable unit={unit} onCityClick={handleSearch} />
          </div>
        </main>

        <footer className="mt-16 text-center opacity-40 text-sm pb-8">
          <p>© {new Date().getFullYear()} SkyCast Pro. All rights reserved.</p>
          <p className="mt-1">Built with Gemini Intelligence & Open-Meteo Data</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
