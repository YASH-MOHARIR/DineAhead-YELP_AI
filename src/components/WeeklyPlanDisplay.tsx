// components/WeeklyPlanDisplay.tsx
import { useState, type DragEvent } from 'react';
import type { WeeklyPlanType, DayOfWeek, MealTime, Restaurant, UserPreferences, Filters } from '../types';
import { DAYS, MEAL_TIMES, DAY_LABELS, MEAL_ICONS, DIETARY_OPTIONS, ALLERGEN_OPTIONS, CUISINE_OPTIONS } from '../constants';

interface WeeklyPlanDisplayProps {
  plan: WeeklyPlanType;
  budget: number;
  onRemove: (day: DayOfWeek, meal: MealTime) => void;
  onDrop: (day: DayOfWeek, meal: MealTime, restaurant: Restaurant) => void;
  onViewRestaurant: (restaurant: Restaurant) => void;
  onFinish: () => void;
  hasPlan: boolean;
  preferences: UserPreferences;
  filters: Filters;
  onUpdatePreferences: (p: UserPreferences) => void;
  onUpdateFilters: (f: Filters) => void;
}

export default function WeeklyPlanDisplay({ 
  plan, budget, onRemove, onDrop, onViewRestaurant, onFinish, hasPlan,
  preferences, filters, onUpdatePreferences, onUpdateFilters
}: WeeklyPlanDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<DayOfWeek>('monday');
  const [dragOverSlot, setDragOverSlot] = useState<{ day: DayOfWeek; meal: MealTime } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate totals
  const calculateDayTotal = (day: DayOfWeek): number => {
    const dayPlan = plan[day];
    return (dayPlan.breakfast?.restaurant.estimatedCost || 0) +
           (dayPlan.lunch?.restaurant.estimatedCost || 0) +
           (dayPlan.dinner?.restaurant.estimatedCost || 0);
  };

  const calculateDayMeals = (day: DayOfWeek): number => {
    const dayPlan = plan[day];
    return (dayPlan.breakfast ? 1 : 0) + (dayPlan.lunch ? 1 : 0) + (dayPlan.dinner ? 1 : 0);
  };

  const totalSpent = DAYS.reduce((sum, day) => sum + calculateDayTotal(day), 0);
  const totalMeals = DAYS.reduce((sum, day) => sum + calculateDayMeals(day), 0);
  const remaining = budget - totalSpent;
  const progressPercent = Math.min((totalSpent / budget) * 100, 100);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, day: DayOfWeek, meal: MealTime) => {
    e.preventDefault();
    setDragOverSlot({ day, meal });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, day: DayOfWeek, meal: MealTime) => {
    e.preventDefault();
    setDragOverSlot(null);
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const restaurant: Restaurant = JSON.parse(data);
      onDrop(day, meal, restaurant);
    }
  };

  const toggleAllergen = (a: string) => {
    const updated = preferences.allergens.includes(a) 
      ? preferences.allergens.filter(x => x !== a) 
      : [...preferences.allergens, a];
    onUpdatePreferences({ ...preferences, allergens: updated });
  };

  const toggleCuisine = (c: string) => {
    const inLikes = preferences.cuisineLikes.includes(c);
    const inDislikes = preferences.cuisineDislikes.includes(c);
    
    if (!inLikes && !inDislikes) {
      // Add to likes
      onUpdatePreferences({ ...preferences, cuisineLikes: [...preferences.cuisineLikes, c] });
    } else if (inLikes) {
      // Move to dislikes
      onUpdatePreferences({ 
        ...preferences, 
        cuisineLikes: preferences.cuisineLikes.filter(x => x !== c),
        cuisineDislikes: [...preferences.cuisineDislikes, c]
      });
    } else {
      // Remove from dislikes
      onUpdatePreferences({ ...preferences, cuisineDislikes: preferences.cuisineDislikes.filter(x => x !== c) });
    }
  };

  return (
    <div className="space-y-3">
      {/* Settings Panel */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <span className="font-semibold text-gray-800">Quick Settings</span>
          </div>
          <span className={`transform transition-transform ${showSettings ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showSettings && (
          <div className="p-4 space-y-3 border-t max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">📍 Location</label>
              <input 
                type="text"
                value={filters?.location || ''}
                onChange={(e) => onUpdateFilters({ ...filters, location: e.target.value })}
                className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none"
                placeholder="Zip code or city"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">💰 Budget: ${filters?.budget || 350}/week</label>
              <input 
                type="range"
                min="150"
                max="700"
                step="25"
                value={filters?.budget || 350}
                onChange={(e) => onUpdateFilters({ ...filters, budget: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$150</span>
                <span>$700</span>
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">🚗 Distance: {filters?.distance || 5}mi</label>
              <input 
                type="range"
                min="1"
                max="20"
                value={filters?.distance || 5}
                onChange={(e) => onUpdateFilters({ ...filters, distance: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Dietary */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">🥗 Dietary</label>
              <select
                value={preferences?.dietary || ''}
                onChange={(e) => onUpdatePreferences({ ...preferences, dietary: e.target.value as any || null })}
                className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none"
              >
                <option value="">Any</option>
                {DIETARY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Allergens */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">🚫 Allergens</label>
              <div className="flex flex-wrap gap-1">
                {ALLERGEN_OPTIONS.slice(0, 6).map(a => (
                  <button
                    key={a}
                    onClick={() => toggleAllergen(a)}
                    className={`text-xs px-2 py-1 rounded-full transition-all ${
                      preferences?.allergens?.includes(a)
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">🍽️ Cuisines</label>
              <div className="flex flex-wrap gap-1">
                {CUISINE_OPTIONS.slice(0, 8).map(c => {
                  const isLiked = preferences?.cuisineLikes?.includes(c);
                  const isDisliked = preferences?.cuisineDislikes?.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`text-xs px-2 py-1 rounded-full transition-all ${
                        isLiked ? 'bg-green-100 text-green-700 border border-green-300' :
                        isDisliked ? 'bg-red-100 text-red-700 border border-red-300' :
                        'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isLiked && '👍 '}{isDisliked && '👎 '}{c}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Tap: like 👍 → dislike 👎 → remove</p>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Plan */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="animate-float">📅</span> Your Week
            </h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {totalMeals}/21 meals
            </span>
          </div>
          
          {/* Budget Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="opacity-90">Weekly Budget</span>
              <span className="font-bold">
                ${totalSpent} / ${budget}
                <span className={`ml-2 ${remaining >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  ({remaining >= 0 ? `$${remaining} left` : `$${Math.abs(remaining)} over`})
                </span>
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  remaining >= 0 ? 'bg-white' : 'bg-red-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex border-b overflow-x-auto scrollbar-hide bg-white">
          {DAYS.map(day => {
            const isExpanded = expandedDay === day;
            return (
              <button
                key={day}
                onClick={() => setExpandedDay(day)}
                className={`flex-1 min-w-[70px] py-3 px-2 flex flex-col items-center gap-1.5 transition-all relative ${
                  isExpanded 
                    ? 'bg-orange-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Day Label */}
                <span className={`text-xs font-bold uppercase ${
                  isExpanded ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {DAY_LABELS[day].short}
                </span>
                
                {/* Progress dots */}
                <div className="flex justify-center gap-1">
                  {MEAL_TIMES.map(meal => (
                    <div 
                      key={meal}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        plan[day][meal] ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Active indicator */}
                {isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Expanded Day Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 text-lg">
                {DAY_LABELS[expandedDay].full}
              </h4>
              <p className="text-xs text-gray-500 uppercase">{DAY_LABELS[expandedDay].short}</p>
            </div>
            <span className="text-sm text-gray-500">
              ${calculateDayTotal(expandedDay)} today
            </span>
          </div>

          {/* Meal Slots */}
          <div className="space-y-2">
            {MEAL_TIMES.map((meal, index) => {
              const mealSlot = plan[expandedDay][meal];
              const isDragOver = dragOverSlot?.day === expandedDay && dragOverSlot?.meal === meal;
              
              return (
                <div
                  key={meal}
                  onDragOver={(e) => handleDragOver(e, expandedDay, meal)}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleDrop(e, expandedDay, meal)}
                  className={`p-3 rounded-xl transition-all duration-200 border-2 animate-fade-in-up ${
                    isDragOver
                      ? 'border-orange-400 bg-orange-50 scale-[1.02]'
                      : mealSlot
                      ? 'border-transparent bg-gray-50 hover:bg-gray-100'
                      : 'border-dashed border-gray-200 bg-gray-50/50 hover:border-orange-300'
                  }`}
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-8">{MEAL_ICONS[meal]}</span>
                    <span className={`font-medium capitalize w-16 text-sm ${
                      mealSlot ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {meal}
                    </span>
                    
                    {mealSlot ? (
                      <div className="flex-1 flex items-center gap-2">
                        <img 
                          src={mealSlot.restaurant.imageUrl}
                          alt={mealSlot.restaurant.name}
                          className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all"
                          onClick={() => onViewRestaurant(mealSlot.restaurant)}
                          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${mealSlot.restaurant.id}/100/100`; }}
                        />
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => onViewRestaurant(mealSlot.restaurant)}
                        >
                          <p className="font-medium text-gray-800 text-sm truncate hover:text-orange-600 transition-colors">
                            {mealSlot.restaurant.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {mealSlot.restaurant.priceLevel} • ${mealSlot.restaurant.estimatedCost}
                          </p>
                        </div>
                        <button 
                          onClick={() => onRemove(expandedDay, meal)}
                          className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-gray-400 text-sm">
                        {isDragOver ? (
                          <span className="text-orange-500 font-medium animate-pulse">
                            Drop here!
                          </span>
                        ) : (
                          <span>Drop a restaurant or ask AI</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tips */}
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Ask the AI "Plan {DAY_LABELS[expandedDay].full}'s meals" or drag restaurants from chat
            </p>
          </div>
        </div>

        {/* Finish Button */}
        {hasPlan && (
          <div className="p-4 border-t bg-gray-50">
            <button 
              onClick={onFinish}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl 
                         font-semibold hover:from-orange-600 hover:to-rose-600 transition-all 
                         shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>Review & Finish Plan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}