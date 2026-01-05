
import React from 'react';

export const SkeletonCard = () => (
  <div className="animate-pulse bg-white/20 p-6 rounded-3xl h-64 w-full glass-morphism">
    <div className="flex justify-between items-start mb-4">
      <div className="h-8 bg-white/30 rounded w-32"></div>
      <div className="h-12 w-12 bg-white/30 rounded-full"></div>
    </div>
    <div className="h-16 bg-white/30 rounded w-24 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-white/30 rounded w-full"></div>
      <div className="h-4 bg-white/30 rounded w-3/4"></div>
    </div>
  </div>
);

export const SkeletonForecast = () => (
  <div className="flex space-x-4 overflow-x-auto pb-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="animate-pulse flex-shrink-0 w-32 h-40 bg-white/20 rounded-2xl glass-morphism"></div>
    ))}
  </div>
);
