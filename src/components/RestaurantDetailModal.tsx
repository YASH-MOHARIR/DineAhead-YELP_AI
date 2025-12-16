// components/RestaurantDetailModal.tsx
import { useState } from 'react';
import type { Restaurant, UserPreferences, Filters, DayOfWeek } from '../types';
import { DAYS } from '../constants';
import { getMatchIndicators, getMatchScore } from '../utils/matching';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Plus,
  ImageIcon
} from 'lucide-react';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onAddToDay: (day: DayOfWeek) => void;
  preferences: UserPreferences;
  filters: Filters;
}

export default function RestaurantDetailModal({ 
  restaurant, onClose, onAddToDay, preferences, filters 
}: RestaurantDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  
  const matchIndicators = getMatchIndicators(restaurant, preferences, filters);
  const matchScore = getMatchScore(restaurant, preferences, filters);

  const handleAdd = () => {
    if (selectedDay) {
      onAddToDay(selectedDay);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="glass bg-white/90 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-orange-200 to-rose-200">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${restaurant.id}/600/300`; }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 glass-dark text-white w-10 h-10 rounded-full 
                       flex items-center justify-center hover:bg-white/30 transition-all hover-scale"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-full shadow-lg animate-fade-in-up">
            <span className={`font-bold ${
              matchScore >= 70 ? 'text-green-600' : matchScore >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {matchScore}% Match
            </span>
          </div>
          {restaurant.supportsReservation && (
            <div className="absolute bottom-4 right-4 glass-orange px-3 py-1.5 rounded-full text-sm font-medium text-orange-700 animate-fade-in-up delay-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Reservations Available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-4 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{restaurant.name}</h2>
            <p className="text-gray-600">{restaurant.cuisine} • {restaurant.priceLevel} • {restaurant.distance}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-800">{restaurant.rating}</span>
              <span className="text-gray-400">({restaurant.reviewCount.toLocaleString()} reviews)</span>
            </div>
          </div>

          {/* Match Indicators */}
          <div className="flex flex-wrap gap-2 mb-4 animate-fade-in-up delay-100">
            {matchIndicators.map((ind, i) => (
              <span 
                key={i} 
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all animate-fade-in ${
                  ind.matched 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                    : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {ind.icon} {ind.label}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 glass rounded-xl mb-4 animate-fade-in-up delay-150">
            {(['overview', 'reviews', 'photos'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg capitalize font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="h-44 overflow-y-auto mb-4 custom-scrollbar animate-fade-in">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {restaurant.summaries.medium || restaurant.summaries.short || restaurant.contextualSummary || 'No description available.'}
                </p>
                <div className="glass-orange rounded-xl p-3 space-y-2">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" /> {restaurant.address}
                  </p>
                  {restaurant.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" /> {restaurant.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" /> ~${restaurant.estimatedCost} per meal
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating Summary */}
                <div className="glass-orange rounded-xl p-4 flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold gradient-text">{restaurant.rating}</span>
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(restaurant.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{restaurant.reviewCount.toLocaleString()} reviews</p>
                    <p className="text-xs text-gray-500">Overall Yelp rating</p>
                  </div>
                </div>

                {/* Review Snippets */}
                {restaurant.reviewSnippets.length > 0 ? (
                  <div className="space-y-2">
                    {restaurant.reviewSnippets.map((r, i) => (
                      <div key={i} className="glass rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                        {r.rating && (
                          <div className="flex gap-0.5 mb-1">
                            {[...Array(5)].map((_, j) => (
                              <Star 
                                key={j} 
                                className={`w-3 h-3 ${j < r.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-gray-700 italic">"{r.text}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No review snippets available</p>
                )}
                
                <a 
                  href={restaurant.yelpUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-center text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
                >
                  Read all reviews on Yelp <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
            
            {activeTab === 'photos' && (
              <div>
                {restaurant.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {restaurant.photos.map((photo, i) => (
                      <img 
                        key={i}
                        src={photo}
                        alt={`${restaurant.name} photo ${i + 1}`}
                        className="w-full h-32 object-cover rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No photos available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add to Day */}
          <div className="border-t pt-4 animate-fade-in-up delay-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Add to your plan:</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {DAYS.map(day => (
                <button 
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    selectedDay === day 
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' 
                      : 'glass hover:bg-white/80 text-gray-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleAdd}
                disabled={!selectedDay}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl 
                           font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg 
                           hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                           disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add to {selectedDay ? selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1) : 'Day'}
              </button>
              <a 
                href={restaurant.yelpUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-3 px-4 glass text-gray-600 rounded-xl font-semibold 
                           hover:bg-white/80 transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-5 h-5" /> Yelp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}