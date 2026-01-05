
import React, { useState, useEffect } from 'react';
import { CityWeatherSummary, Unit, WeatherCondition } from '../types';
import { MAJOR_CITIES } from '../constants';

interface WeatherTableProps {
  unit: Unit;
  onCityClick: (city: string) => void;
}

const WeatherTable: React.FC<WeatherTableProps> = ({ unit, onCityClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [citiesData, setCitiesData] = useState<CityWeatherSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    // Simulated fetch for the table cities
    const mockData: CityWeatherSummary[] = MAJOR_CITIES.map((name, index) => ({
      id: index.toString(),
      name,
      country: "Global",
      temp: Math.floor(Math.random() * 30),
      condition: [WeatherCondition.Clear, WeatherCondition.Cloudy, WeatherCondition.Rainy][Math.floor(Math.random() * 3)] as WeatherCondition,
      humidity: Math.floor(Math.random() * 60) + 20,
      windSpeed: Math.floor(Math.random() * 20)
    }));
    setCitiesData(mockData);
    setLoading(false);
  }, []);

  const totalPages = Math.ceil(citiesData.length / itemsPerPage);
  const currentData = citiesData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatTemp = (celsius: number) => {
    if (unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  };

  return (
    <div className="glass-morphism rounded-3xl overflow-hidden mt-8 shadow-xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-xl font-bold">Global Forecasts</h3>
        <span className="text-sm opacity-60">25 Cities Tracked</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Temperature</th>
              <th className="px-6 py-4">Condition</th>
              <th className="px-6 py-4">Humidity</th>
              <th className="px-6 py-4">Wind</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center animate-pulse">Loading index...</td></tr>
            ) : (
              currentData.map((city) => (
                <tr 
                  key={city.id} 
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => onCityClick(city.name)}
                >
                  <td className="px-6 py-4 font-medium">{city.name}</td>
                  <td className="px-6 py-4">{formatTemp(city.temp)}°{unit}</td>
                  <td className="px-6 py-4">{city.condition}</td>
                  <td className="px-6 py-4">{city.humidity}%</td>
                  <td className="px-6 py-4">{city.windSpeed} km/h</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-white/5 flex items-center justify-between">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all"
        >
          Previous
        </button>
        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WeatherTable;
