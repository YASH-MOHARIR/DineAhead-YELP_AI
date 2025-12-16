// components/WeeklyPlanDisplay.tsx
import { DragEvent } from 'react';
import type { WeeklyPlanType, DayOfWeek, Restaurant } from '../types';
import { DAYS } from '../constants';
import RestaurantCard from './RestaurantCard';

interface WeeklyPlanDisplayProps {
  plan: WeeklyPlanType;
  budget: number;
  onRemove: (day: DayOfWeek) => void;
  onDrop: (day: DayOfWeek, restaurant: Restaurant) => void;
  onViewRestaurant: (restaurant: Restaurant) => void;
  dragOverDay: DayOfWeek | null;
  setDragOverDay: (day: DayOfWeek | null) => void;
  onFinish: () => void;
  hasPlan: boolean;
}

export default function WeeklyPlanDisplay({ 
  plan, budget, onRemove, onDrop, onViewRestaurant, dragOverDay, setDragOverDay, onFinish, hasPlan
}: WeeklyPlanDisplayProps) {
  const totalSpent = DAYS.reduce((sum, day) => sum + (plan[day]?.restaurant.estimatedCost || 0), 0);
  const remaining = budget - totalSpent;
  const filledDays = DAYS.filter(d => plan[d]).length;
  const progressPercent = Math.min((totalSpent / budget) * 100, 100);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, day: DayOfWeek) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, day: DayOfWeek) => {
    e.preventDefault();
    setDragOverDay(null);
    const data = e.dataTransfer.getData('application/json');
    if (data) onDrop(day, JSON.parse(data));
  };

  return (
    <div className="glass rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="animate-float">📅</span> Your Week
          </h3>
          <span className="glass-dark px-3 py-1 rounded-full text-sm">
            {filledDays}/5 days
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Budget Progress */}
        <div className="mb-4 animate-fade-in">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">💰 Budget</span>
            <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              ${remaining >= 0 ? remaining : Math.abs(remaining)} {remaining >= 0 ? 'left' : 'over'}
            </span>
          </div>
          <div className="h-3 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                remaining >= 0 
                  ? 'bg-gradient-to-r from-orange-400 to-rose-400' 
                  : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="h-full w-full animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$0</span>
            <span>${budget}</span>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-2">
          {DAYS.map((day, index) => (
            <div 
              key={day}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => handleDrop(e, day)}
              className={`p-3 rounded-xl transition-all duration-300 animate-fade-in-up border-2 ${
                dragOverDay === day 
                  ? 'border-orange-400 bg-orange-100/50 scale-[1.02] shadow-lg' 
                  : 'border-transparent bg-white/50 hover:bg-white/70'
              }`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className={`font-semibold capitalize w-10 text-sm ${
                  plan[day] ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  {day.slice(0, 3)}
                </span>
                
                {plan[day] ? (
                  <div className="flex-1 flex items-center gap-2 animate-scale-in">
                    <RestaurantCard
                      restaurant={plan[day]!.restaurant}
                      size="mini"
                      onClick={() => onViewRestaurant(plan[day]!.restaurant)}
                      className="flex-1"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemove(day); }} 
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all hover-scale"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2 text-gray-400 text-sm">
                    <span className="flex-1">
                      {dragOverDay === day ? (
                        <span className="text-orange-500 font-medium animate-pulse">↓ Drop here!</span>
                      ) : (
                        'Drop a restaurant'
                      )}
                    </span>
                    <span className="text-xs opacity-50">⋮⋮</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <p className="text-xs text-gray-400 mt-4 text-center animate-fade-in delay-500">
          💡 Drag restaurants from chat to add them
        </p>

        {/* Finish Button */}
        {hasPlan && (
          <button 
            onClick={onFinish}
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-semibold 
                       hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl 
                       hover-lift animate-fade-in-up delay-300 flex items-center justify-center gap-2"
          >
            <span>✓</span>
            <span>Finish Plan</span>
            <span className="text-sm opacity-75">→</span>
          </button>
        )}
      </div>
    </div>
  );
}