// components/PlanSummary.tsx
import { useState } from 'react';
import type { WeeklyPlanType, Filters, Restaurant, DayOfWeek } from '../types';
import { DAYS, MEAL_TIMES, MEAL_ICONS, MEAL_LABELS } from '../constants';
import { exportToCalendar, exportToPDF } from '../utils/calendar';
import { 
  ArrowLeft, Save, Share2, Download, Calendar, ChevronDown, ChevronUp,
  MapPin, DollarSign, Star, Link2, Image, Check
} from 'lucide-react';

interface PlanSummaryProps {
  plan: WeeklyPlanType;
  filters: Filters;
  onBack: () => void;
  onSave: (name: string) => void;
  onViewRestaurant: (restaurant: Restaurant) => void;
}

export default function PlanSummary({ plan, filters, onBack, onSave, onViewRestaurant }: PlanSummaryProps) {
  const [expandedDays, setExpandedDays] = useState<Set<DayOfWeek>>(new Set(DAYS));
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Calculate totals
  const { filledCount, totalCost } = DAYS.reduce((acc, day) => {
    MEAL_TIMES.forEach(meal => {
      if (plan[day][meal]) {
        acc.filledCount++;
        acc.totalCost += plan[day][meal]!.restaurant.estimatedCost;
      }
    });
    return acc;
  }, { filledCount: 0, totalCost: 0 });

  const toggleDay = (day: DayOfWeek) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName);
      setShowSaveDialog(false);
      setSaveName('');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    setShareUrl(url);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCalendar = () => {
    const blob = exportToCalendar(plan, filters.location);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.ics';
    a.click();
  };

  const handleCopyPlan = () => {
    let text = `🍽️ DineAhead Weekly Meal Plan - ${filters.location}\n\n`;
    DAYS.forEach(day => {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      text += `${dayName}:\n`;
      MEAL_TIMES.forEach(meal => {
        const slot = plan[day][meal];
        if (slot) {
          text += `  ${MEAL_ICONS[meal]} ${MEAL_LABELS[meal]}: ${slot.restaurant.name} ($${slot.restaurant.estimatedCost})\n`;
        }
      });
      text += '\n';
    });
    text += `💰 Total: $${totalCost} / $${filters.budget}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl animate-pulse-soft delay-300"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="mb-6 animate-fade-in-down">
          <button 
            onClick={onBack}
            className="glass px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 
                       hover-lift transition-all flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Planning
          </button>
          
          <div className="glass rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Weekly Meal Plan</h1>
            <p className="text-gray-600">
              {filledCount}/21 meals planned • {filters.location}
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <div className={`text-2xl font-bold ${totalCost <= filters.budget ? 'text-green-600' : 'text-red-600'}`}>
                ${totalCost}
              </div>
              <div className="text-gray-500">of ${filters.budget} budget</div>
              {totalCost <= filters.budget && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Under Budget!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in-up delay-100">
          <button 
            onClick={() => setShowSaveDialog(true)}
            className="glass rounded-xl p-4 text-center hover:bg-white/80 transition-all hover-lift"
          >
            <Save className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-sm font-medium text-gray-700">Save Plan</div>
          </button>
          
          <button 
            onClick={handleShare}
            className="glass rounded-xl p-4 text-center hover:bg-white/80 transition-all hover-lift"
          >
            <Share2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium text-gray-700">
              {copied ? 'Copied!' : 'Share Link'}
            </div>
          </button>
          
          <button 
            onClick={handleExportCalendar}
            className="glass rounded-xl p-4 text-center hover:bg-white/80 transition-all hover-lift"
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-sm font-medium text-gray-700">Calendar</div>
          </button>
          
          <button 
            onClick={handleCopyPlan}
            className="glass rounded-xl p-4 text-center hover:bg-white/80 transition-all hover-lift"
          >
            <Link2 className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-sm font-medium text-gray-700">Copy Text</div>
          </button>
        </div>

        {/* Days */}
        <div className="space-y-3 animate-fade-in-up delay-200">
          {DAYS.map(day => {
            const dayMeals = MEAL_TIMES.map(meal => plan[day][meal]).filter(Boolean);
            const dayCost = dayMeals.reduce((sum, slot) => sum + slot!.restaurant.estimatedCost, 0);
            const isExpanded = expandedDays.has(day);
            
            return (
              <div key={day} className="glass rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 
                                    flex items-center justify-center text-white font-bold">
                      {day.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 capitalize">{day}</h3>
                      <p className="text-sm text-gray-600">
                        {dayMeals.length}/3 meals • ${dayCost}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && dayMeals.length > 0 && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in">
                    {MEAL_TIMES.map(meal => {
                      const slot = plan[day][meal];
                      if (!slot) return null;
                      
                      return (
                        <div
                          key={meal}
                          onClick={() => onViewRestaurant(slot.restaurant)}
                          className="glass-dark rounded-lg p-4 cursor-pointer hover:bg-white/80 
                                     transition-all hover-lift group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{MEAL_ICONS[meal]}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500">{MEAL_LABELS[meal]}</span>
                              </div>
                              <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                {slot.restaurant.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{slot.restaurant.cuisine}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-gray-700">{slot.restaurant.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-700">${slot.restaurant.estimatedCost}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{slot.restaurant.distance}</span>
                                </div>
                              </div>
                            </div>
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
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Save Your Plan</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter plan name..."
              className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 
                         focus:border-orange-400 focus:shadow-lg focus:outline-none 
                         placeholder-gray-400 transition-all mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 glass px-4 py-3 rounded-xl font-medium text-gray-700 
                           hover:bg-white/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-3 
                           rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 
                           disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                           transition-all shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}