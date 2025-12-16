// components/RestaurantCard.tsx
import type { DragEvent } from 'react';
import type { Restaurant, UserPreferences, Filters } from '../types';
import { getMatchScore, getMatchIndicators } from '../utils/matching';
import { Star, Calendar, GripVertical } from 'lucide-react';

type CardSize = 'mini' | 'compact' | 'full';

interface RestaurantCardProps {
  restaurant: Restaurant;
  size?: CardSize;
  onClick?: () => void;
  onDragStart?: (e: DragEvent<HTMLDivElement>, restaurant: Restaurant) => void;
  preferences?: UserPreferences;
  filters?: Filters;
  showMatchScore?: boolean;
  draggable?: boolean;
  className?: string;
}

export default function RestaurantCard({ 
  restaurant, size = 'full', onClick, onDragStart, preferences, filters,
  showMatchScore = false, draggable = false, className = ''
}: RestaurantCardProps) {
  
  const matchScore = (preferences && filters) ? getMatchScore(restaurant, preferences, filters) : null;
  const topIndicators = (preferences && filters)
    ? getMatchIndicators(restaurant, preferences, filters).filter(i => i.matched).slice(0, 2)
    : [];

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      e.currentTarget.classList.add('opacity-50', 'scale-95');
      onDragStart(e, restaurant);
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://picsum.photos/seed/${restaurant.id}/100/100`;
  };

  // Mini size
  if (size === 'mini') {
    return (
      <div 
        className={`flex items-center gap-2 cursor-pointer group ${className}`}
        onClick={onClick}
      >
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name}
          className="w-10 h-10 rounded-lg object-cover ring-2 ring-white/50 
                     group-hover:ring-orange-400 transition-all duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm truncate group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </p>
          <p className="text-xs text-gray-500">
            {restaurant.cuisine} • ${restaurant.estimatedCost}
          </p>
        </div>
      </div>
    );
  }

  // Compact size
  if (size === 'compact') {
    return (
      <div 
        className={`flex items-center gap-4 cursor-pointer group ${className}`}
        onClick={onClick}
      >
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name}
          className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/50 
                     group-hover:ring-orange-400 transition-all duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="flex-1">
          <p className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </p>
          <p className="text-sm text-gray-500">
            {restaurant.cuisine} • {restaurant.priceLevel}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-orange-600">${restaurant.estimatedCost}</p>
          {restaurant.supportsReservation && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Reservations
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full size
  return (
    <div 
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      onClick={onClick}
      className={`bg-white rounded-xl p-3 flex gap-3 items-center 
        shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]
        ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} 
        transition-all duration-300 hover:-translate-y-1 group border border-gray-100 ${className}`}
    >
      <div className="relative">
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name}
          className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/50 
                     group-hover:ring-orange-400 transition-all duration-300"
          onError={handleImageError}
        />
        {showMatchScore && matchScore !== null && (
          <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center 
                          text-xs font-bold text-white shadow-lg animate-scale-in ${
            matchScore >= 70 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
            matchScore >= 40 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
            'bg-gradient-to-br from-red-400 to-red-600'
          }`}>
            {matchScore}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-semibold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </h4>
          {restaurant.supportsReservation && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full animate-fade-in flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          {restaurant.cuisine} • {restaurant.priceLevel} • <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {restaurant.rating}
        </p>
        {topIndicators.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {topIndicators.map((ind, i) => (
              <span 
                key={i} 
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 
                           px-2 py-0.5 rounded-full text-xs font-medium animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {ind.icon} {ind.label}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {draggable && (
        <div className="text-gray-300 group-hover:text-orange-400 transition-colors">
          <GripVertical className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}