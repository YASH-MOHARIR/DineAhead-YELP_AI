// components/PlanSummary.tsx
import { useState } from 'react';
import type { WeeklyPlanType, Filters, DayOfWeek, MealTime, Restaurant } from '../types';
import { DAYS, MEAL_TIMES, DAY_LABELS, MEAL_ICONS } from '../constants';
import { getNextMonday, formatWeekDisplay, downloadCalendar } from '../utils/calendar';

interface PlanSummaryProps {
  plan: WeeklyPlanType;
  filters: Filters;
  onBack: () => void;
  onEdit: () => void;
  onSave: (name: string) => void;
  onViewRestaurant: (restaurant: Restaurant) => void;
}

export default function PlanSummary({ plan, filters, onBack, onEdit, onSave, onViewRestaurant }: PlanSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState('');
  const [saved, setSaved] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<Date>(getNextMonday());
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>('monday');

  // Calculate totals
  const totalCost = DAYS.reduce((sum, d) => {
    return sum + MEAL_TIMES.reduce((mealSum, m) => {
      return mealSum + (plan[d][m]?.restaurant.estimatedCost || 0);
    }, 0);
  }, 0);

  const plannedMeals = DAYS.reduce((sum, d) => {
    return sum + MEAL_TIMES.filter(m => plan[d][m] !== null).length;
  }, 0);

  const getDayTotal = (day: DayOfWeek): number => {
    return MEAL_TIMES.reduce((sum, m) => sum + (plan[day][m]?.restaurant.estimatedCost || 0), 0);
  };

  const getDayMeals = (day: DayOfWeek): number => {
    return MEAL_TIMES.filter(m => plan[day][m] !== null).length;
  };

  const generatePlanText = (): string => {
    let text = `🍽️ My DineAhead Weekly Meal Plan\n`;
    text += `📍 ${filters.location} | 💰 Budget: $${filters.budget}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    DAYS.forEach(day => {
      const dayTotal = getDayTotal(day);
      text += `📅 ${DAY_LABELS[day].full.toUpperCase()} ($${dayTotal})\n`;
      MEAL_TIMES.forEach(meal => {
        const slot = plan[day][meal];
        if (slot) {
          text += `   ${MEAL_ICONS[meal]} ${meal}: ${slot.restaurant.name} - $${slot.restaurant.estimatedCost}\n`;
        }
      });
      text += `\n`;
    });
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 TOTAL: $${totalCost} / $${filters.budget} budget\n`;
    text += `📊 ${plannedMeals}/21 meals planned\n`;
    text += `\nCreated with DineAhead 🍽️`;
    return text;
  };

  const copyToClipboard = async () => {
    const text = generatePlanText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My DineAhead Meal Plan', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Ignore
    }
    setSharing(true);
    setTimeout(() => setSharing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-100 via-rose-50 to-purple-100 p-4 md:p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <button onClick={onBack} className="glass px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 mb-4 transition-all">
          ← Back
        </button>
        
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {plannedMeals >= 15 ? '🎉 Your Week is Planned!' : '📋 Your Meal Plan'}
          </h1>
          <p className="text-gray-600">
            {plannedMeals}/21 meals • ${totalCost} total
            <span className={`ml-2 font-medium ${totalCost <= filters.budget ? 'text-green-600' : 'text-red-500'}`}>
              ({totalCost <= filters.budget ? `$${filters.budget - totalCost} under budget` : `$${totalCost - filters.budget} over budget`})
            </span>
          </p>
        </div>

        {/* Week Overview */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-fade-in-up">
          <div className="bg-linear-to-r from-orange-500 to-rose-500 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">🍽️ Weekly Overview</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                📍 {filters.location}
              </span>
            </div>
          </div>

          {/* Day Cards */}
          <div className="divide-y">
            {DAYS.map((day, index) => {
              const dayMeals = getDayMeals(day);
              const dayTotal = getDayTotal(day);
              const isExpanded = expandedDay === day;
              
              return (
                <div key={day} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Day Header - Clickable */}
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${dayMeals > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {DAY_LABELS[day].full}
                      </span>
                      <div className="flex gap-1">
                        {MEAL_TIMES.map(m => (
                          <div 
                            key={m}
                            className={`w-2 h-2 rounded-full ${plan[day][m] ? 'bg-orange-500' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{dayMeals}/3 meals</span>
                      <span className="font-medium text-gray-700">${dayTotal}</span>
                      <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>
                  
                  {/* Expanded Meals */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50 space-y-2 animate-fade-in">
                      {MEAL_TIMES.map(meal => {
                        const slot = plan[day][meal];
                        return (
                          <div 
                            key={meal}
                            className={`p-3 rounded-xl ${slot ? 'bg-white shadow-sm' : 'bg-gray-100'}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg w-8">{MEAL_ICONS[meal]}</span>
                              <span className="font-medium capitalize w-20 text-sm text-gray-600">{meal}</span>
                              
                              {slot ? (
                                <div 
                                  className="flex-1 flex items-center gap-3 cursor-pointer"
                                  onClick={() => onViewRestaurant(slot.restaurant)}
                                >
                                  <img 
                                    src={slot.restaurant.imageUrl}
                                    alt=""
                                    className="w-10 h-10 rounded-lg object-cover"
                                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${slot.restaurant.id}/100/100`; }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 text-sm truncate hover:text-orange-600">
                                      {slot.restaurant.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {slot.restaurant.cuisine} • {slot.restaurant.priceLevel}
                                    </p>
                                  </div>
                                  <span className="font-semibold text-orange-600">
                                    ${slot.restaurant.estimatedCost}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Not planned</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Footer */}
          <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center">
            <span className="font-medium text-gray-700">Weekly Total</span>
            <div>
              <span className={`text-2xl font-bold ${totalCost <= filters.budget ? 'text-green-600' : 'text-red-500'}`}>
                ${totalCost}
              </span>
              <span className="text-gray-400 ml-2">/ ${filters.budget}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 animate-fade-in-up delay-200">
          <button 
            onClick={() => setShowSaveDialog(true)} 
            disabled={saved}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex flex-col items-center gap-1
                       disabled:opacity-50"
          >
            <span className="text-2xl">{saved ? '✓' : '💾'}</span>
            <span className="text-sm font-medium text-gray-700">{saved ? 'Saved!' : 'Save'}</span>
          </button>
          
          <button 
            onClick={copyToClipboard}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex flex-col items-center gap-1"
          >
            <span className="text-2xl">{copied ? '✓' : '📋'}</span>
            <span className="text-sm font-medium text-gray-700">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button 
            onClick={shareLink}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex flex-col items-center gap-1"
          >
            <span className="text-2xl">{sharing ? '✓' : '🔗'}</span>
            <span className="text-sm font-medium text-gray-700">{sharing ? 'Shared!' : 'Share'}</span>
          </button>
          
          <button 
            onClick={onEdit}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex flex-col items-center gap-1"
          >
            <span className="text-2xl">✏️</span>
            <span className="text-sm font-medium text-gray-700">Edit</span>
          </button>
        </div>

        {/* Calendar Export */}
        <button 
          onClick={() => downloadCalendar(plan, selectedWeek)}
          className="w-full bg-linear-to-r from-orange-500 to-rose-500 text-white p-4 rounded-xl 
                     font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2
                     hover:-translate-y-0.5"
        >
          <span>📅</span>
          <span>Export to Calendar</span>
        </button>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
               onClick={() => setShowSaveDialog(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in" 
                 onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">💾 Save Your Plan</h3>
              <input 
                type="text" 
                placeholder="Plan name..." 
                value={planName} 
                onChange={e => setPlanName(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-orange-500 focus:outline-none" 
                autoFocus 
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveDialog(false)} 
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onSave(planName.trim() || `Plan ${new Date().toLocaleDateString()}`);
                    setSaved(true);
                    setShowSaveDialog(false);
                    setPlanName('');
                  }}
                  className="flex-1 py-3 bg-linear-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}