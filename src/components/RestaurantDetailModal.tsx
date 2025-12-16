// components/RestaurantDetailModal.tsx
import { useState } from 'react';
import type { Restaurant, UserPreferences, Filters, DayOfWeek, MealTime } from '../types';
import { DAYS, MEAL_TIMES, DAY_LABELS, MEAL_ICONS } from '../constants';
import { getMatchIndicators, getMatchScore } from '../utils/matching';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onAddToDay: (day: DayOfWeek, meal: MealTime) => void;
  preferences: UserPreferences;
  filters: Filters;
}

export default function RestaurantDetailModal({ 
  restaurant, onClose, onAddToDay, preferences, filters 
}: RestaurantDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealTime | null>(null);
  
  const matchIndicators = getMatchIndicators(restaurant, preferences, filters);
  const matchScore = getMatchScore(restaurant, preferences, filters);

  const handleAdd = () => {
    if (selectedDay && selectedMeal) {
      onAddToDay(selectedDay, selectedMeal);
      onClose();
    }
  };

  // Suggest best meal time based on price
  const suggestedMeal: MealTime = 
    restaurant.estimatedCost <= 15 ? 'breakfast' :
    restaurant.estimatedCost <= 28 ? 'lunch' : 'dinner';

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-44 bg-gradient-to-br from-orange-200 to-rose-200">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${restaurant.id}/600/300`; }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white w-10 h-10 rounded-full 
                       flex items-center justify-center hover:bg-black/50 transition-all"
          >
            ✕
          </button>
          
          {/* Price & Match badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg font-bold text-gray-800">
              {restaurant.priceLevel} ~${restaurant.estimatedCost}
            </span>
            <span className={`px-3 py-1.5 rounded-full shadow-lg font-bold text-white ${
              matchScore >= 70 ? 'bg-green-500' : matchScore >= 40 ? 'bg-yellow-500' : 'bg-gray-500'
            }`}>
              {matchScore}% match
            </span>
          </div>
          
          {/* Suggested meal badge */}
          <div className="absolute bottom-4 right-4">
            <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              {MEAL_ICONS[suggestedMeal]} Best for {suggestedMeal}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{restaurant.name}</h2>
            <p className="text-gray-600">{restaurant.cuisine} • {restaurant.distance}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-gray-400">({restaurant.reviewCount.toLocaleString()} reviews)</span>
            </div>
          </div>

          {/* Match Indicators */}
          <div className="flex flex-wrap gap-2 mb-4">
            {matchIndicators.slice(0, 4).map((ind, i) => (
              <span 
                key={i} 
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ind.matched 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {ind.icon} {ind.label}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
            {(['overview', 'reviews', 'photos'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg capitalize text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white shadow text-gray-800' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[100px] mb-4">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {restaurant.summaries.medium || restaurant.summaries.short || restaurant.contextualSummary || 'A great dining option in your area.'}
                </p>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                  <p className="text-gray-600">📍 {restaurant.address}</p>
                  {restaurant.phone && <p className="text-gray-600">📞 {restaurant.phone}</p>}
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl font-bold text-orange-600">{restaurant.rating}</span>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(restaurant.rating) ? 'text-yellow-500' : 'text-gray-300'}>⭐</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{restaurant.reviewCount.toLocaleString()} reviews</p>
                  </div>
                </div>
                {restaurant.reviewSnippets.length > 0 ? (
                  restaurant.reviewSnippets.slice(0, 3).map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-700 italic">"{r.text}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No review snippets available</p>
                )}
              </div>
            )}
            
            {activeTab === 'photos' && (
              restaurant.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {restaurant.photos.slice(0, 6).map((p, i) => (
                    <img 
                      key={i} 
                      src={p} 
                      alt="" 
                      className="w-full h-20 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No photos available</p>
              )
            )}
          </div>
        </div>

        {/* Add to Plan Section */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-3">Add to your plan:</p>
          
          <div className="flex gap-2 mb-3">
            {/* Day Selection */}
            <select 
              value={selectedDay || ''} 
              onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
              className="flex-1 p-3 bg-white rounded-xl border-2 border-gray-200 focus:border-orange-400 
                         focus:outline-none text-sm font-medium"
            >
              <option value="">Select day...</option>
              {DAYS.map(d => (
                <option key={d} value={d}>{DAY_LABELS[d].full}</option>
              ))}
            </select>
            
            {/* Meal Selection */}
            <select 
              value={selectedMeal || ''} 
              onChange={e => setSelectedMeal(e.target.value as MealTime)}
              className="flex-1 p-3 bg-white rounded-xl border-2 border-gray-200 focus:border-orange-400 
                         focus:outline-none text-sm font-medium"
            >
              <option value="">Select meal...</option>
              {MEAL_TIMES.map(m => (
                <option key={m} value={m}>{MEAL_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAdd}
              disabled={!selectedDay || !selectedMeal}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl 
                         font-semibold hover:from-orange-600 hover:to-rose-600 
                         disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                         transition-all shadow-lg"
            >
              Add to Plan
            </button>
            <a 
              href={restaurant.yelpUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 
                         hover:bg-orange-50 transition-all flex items-center justify-center"
            >
              🔗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}