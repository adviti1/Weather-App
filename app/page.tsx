'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CurrentWeather, ForecastDay, Unit, Theme, WeatherCondition } from '../types';
import { fetchGeocoding, fetchWeatherData } from '../services/weatherService';
import { WEATHER_ICONS } from '../constants';
import { SkeletonCard, SkeletonForecast } from '../components/SkeletonLoader';
import WeatherTable from '../components/WeatherTable';
import { GoogleGenAI } from "@google/genai";

export default function WeatherPage() {
  const [search, setSearch] = useState('');
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>('C');
  const [theme, setTheme] = useState<Theme>('light');
  const [weatherAdvice, setWeatherAdvice] = useState<string>('');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  const handleOpenKeyPicker = useCallback(async () => {
    const win = window as any;
    if (typeof window !== 'undefined' && win.aistudio) {
      await win.aistudio.openSelectKey();
      // Reset state and attempt to generate advice again
      setIsApiKeyMissing(false);
      if (currentWeather) {
        setTimeout(() => generateAdvice(currentWeather), 500);
      }
    }
  }, [currentWeather]);

  const generateAdvice = useCallback(async (weather: CurrentWeather) => {
    const win = window as any;
    const apiKey = process.env.API_KEY;

    // Check if key is available in process.env or via aistudio helper
    const hasInternalKey = !!apiKey && apiKey !== '';
    let hasSelectedKey = false;
    
    if (typeof window !== 'undefined' && win.aistudio) {
      hasSelectedKey = await win.aistudio.hasSelectedApiKey();
    }

    if (!hasInternalKey && !hasSelectedKey) {
      setIsApiKeyMissing(true);
      setWeatherAdvice("Connect your API key for personalized meteorological insights.");
      return;
    }

    // Even if hasSelectedKey is true, process.env.API_KEY might still be empty for a split second
    if (!apiKey) {
      setIsApiKeyMissing(true);
      setWeatherAdvice("Finalizing connection to Gemini AI...");
      return;
    }

    setIsApiKeyMissing(false);
    setWeatherAdvice("SkyCast AI is generating your tip...");

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a professional 1-sentence meteorologist tip for ${weather.city} where it is currently ${weather.condition} at ${weather.temperature}°C. Max 15 words.`,
        config: {
          systemInstruction: "You are a senior meteorologist providing concise, high-value weather insights for a luxury dashboard.",
        }
      });
      
      if (response.text) {
        setWeatherAdvice(response.text.trim());
      }
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      if (err?.message?.includes("API Key") || err?.message?.includes("Requested entity was not found")) {
        setIsApiKeyMissing(true);
        setWeatherAdvice("Please re-select your Gemini API key.");
      } else {
        setWeatherAdvice("Meteorologist Tip: Dress in breathable layers for maximum comfort today.");
      }
    }
  }, []);

  const handleSearch = useCallback(async (city: string) => {
    if (!city || city.trim() === '') return;
    setLoading(true);
    setError(null);
    try {
      const location = await fetchGeocoding(city);
      const data = await fetchWeatherData(location.latitude, location.longitude, location.name || city);
      setCurrentWeather(data.current);
      setForecast(data.forecast);
    } catch (err: any) {
      setError('City not found. Please check spelling or try a larger nearby city.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationDetection = useCallback(() => {
    if (typeof window !== 'undefined' && "geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeatherData(latitude, longitude, "Your Location");
            setCurrentWeather(data.current);
            setForecast(data.forecast);
          } catch (err) {
            handleSearch('London');
          } finally {
            setLoading(false);
          }
        },
        () => {
          handleSearch('London');
        }
      );
    } else {
      handleSearch('London');
    }
  }, [handleSearch]);

  useEffect(() => {
    handleLocationDetection();
  }, [handleLocationDetection]);

  useEffect(() => {
    if (currentWeather) {
      generateAdvice(currentWeather);
    }
  }, [currentWeather, generateAdvice]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const formatTemp = (celsius: number) => {
    const value = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
    return Math.round(value);
  };

  const getGradientClass = (condition: WeatherCondition) => {
    switch (condition) {
      case WeatherCondition.Clear: return 'weather-gradient-clear';
      case WeatherCondition.Cloudy: return 'weather-gradient-cloudy';
      case WeatherCondition.Rainy: return 'weather-gradient-rainy';
      case WeatherCondition.Snowy: return 'weather-gradient-snow';
      case WeatherCondition.Thunderstorm: return 'bg-slate-800';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
              <svg width="32" height="32" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight hidden sm:block uppercase">SkyCast <span className="text-indigo-600">Pro</span></h1>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} 
              className="px-4 py-2 glass-morphism rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all border border-white/20"
            >
              °{unit}
            </button>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="p-2.5 glass-morphism rounded-xl hover:scale-105 active:scale-95 transition-all border border-white/20"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        <div className="relative mb-10">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(search); }} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search city (e.g., Tokyo, New York)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-[2rem] glass-morphism focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all dark:text-white placeholder:text-slate-400 border border-transparent focus:border-indigo-500/30"
              />
              <svg width="24" height="24" className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Analyzing...' : 'Explore Weather'}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-3 ml-6 font-semibold animate-pulse">{error}</p>}
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {loading ? <SkeletonCard /> : currentWeather && (
              <div className={`relative overflow-hidden p-10 rounded-[3rem] text-white shadow-2xl transition-all duration-1000 transform hover:scale-[1.01] ${getGradientClass(currentWeather.condition)}`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-5xl font-black tracking-tighter drop-shadow-md">{currentWeather.city}</h2>
                      <p className="opacity-90 mt-2 font-medium bg-white/10 inline-block px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl border border-white/30 shadow-inner">
                      {WEATHER_ICONS[currentWeather.condition]}
                    </div>
                  </div>
                  
                  <div className="mt-12 flex items-baseline gap-4">
                    <span className="text-9xl font-black drop-shadow-2xl tabular-nums leading-none">
                      {formatTemp(currentWeather.temperature)}°
                    </span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold opacity-90">{currentWeather.condition}</span>
                      <span className="text-sm opacity-60 font-medium tracking-tight">Real-time Telemetry Active</span>
                    </div>
                  </div>

                  <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/20 pt-10">
                    <div className="text-center group">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2 font-bold group-hover:opacity-100 transition-opacity">Humidity</p>
                      <p className="text-2xl font-black">{currentWeather.humidity}%</p>
                    </div>
                    <div className="text-center border-x border-white/20 group">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2 font-bold group-hover:opacity-100 transition-opacity">Wind Velocity</p>
                      <p className="text-2xl font-black">{currentWeather.windSpeed} <span className="text-xs font-normal">km/h</span></p>
                    </div>
                    <div className="text-center group">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2 font-bold group-hover:opacity-100 transition-opacity">Visibility</p>
                      <p className="text-2xl font-black">14 <span className="text-xs font-normal">km</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Visual Flair */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
              </div>
            )}

            <section>
              <div className="flex items-center justify-between mb-8 px-4">
                <h3 className="text-2xl font-black tracking-tight">5-Day Outlook</h3>
                <div className="h-px flex-grow mx-6 bg-slate-200 dark:bg-slate-800"></div>
              </div>
              
              {loading ? <SkeletonForecast /> : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {forecast.map((day, idx) => (
                    <div key={idx} className="glass-morphism p-6 rounded-[2rem] text-center flex flex-col items-center hover:bg-white/10 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-indigo-500/30 group min-w-[120px]">
                      <p className="text-xs font-black mb-4 opacity-40 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                        {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="mb-4 transform group-hover:scale-110 transition-transform">
                        {WEATHER_ICONS[day.condition]}
                      </div>
                      <p className="text-2xl font-black tracking-tighter">{formatTemp(day.maxTemp)}°</p>
                      <p className="text-[10px] font-bold opacity-30 mt-1">{formatTemp(day.minTemp)}° LOW</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 glass-morphism rounded-[2.5rem] border border-indigo-500/20 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="flex h-3 w-3 items-center justify-center">
                  <span className={`absolute h-3 w-3 rounded-full bg-indigo-500 opacity-75 ${isApiKeyMissing ? '' : 'animate-ping'}`}></span>
                  <span className="relative h-2 w-2 rounded-full bg-indigo-600"></span>
                </div>
                <h4 className="font-black text-[10px] text-indigo-500 uppercase tracking-[0.25em]">Expert Intelligence</h4>
              </div>
              
              <p className="text-base font-medium opacity-90 leading-relaxed relative z-10 italic mb-4">
                "{weatherAdvice}"
              </p>

              {isApiKeyMissing && (
                <div className="relative z-10 mt-4 space-y-3">
                  <button 
                    onClick={handleOpenKeyPicker}
                    className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Connect Gemini Key
                  </button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center text-[10px] font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest"
                  >
                    Gemini Billing Documentation
                  </a>
                </div>
              )}
              
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
            </div>
            
            <WeatherTable unit={unit} onCityClick={handleSearch} />
            
            <div className="p-6 glass-morphism rounded-3xl border border-slate-200 dark:border-slate-800">
               <h4 className="text-xs font-bold opacity-40 uppercase tracking-widest mb-4">Atmospheric Metrics</h4>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-sm opacity-60">Barometer</span>
                    <span className="text-sm font-bold">1012 hPa</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm opacity-60">UV Index</span>
                    <span className="text-sm font-bold">Low (2)</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm opacity-60">Air Quality</span>
                    <span className="text-sm font-bold text-green-500">Optimum</span>
                 </div>
               </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}