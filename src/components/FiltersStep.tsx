// components/FiltersStep.tsx
import type { Filters } from '../types';
import { MEAL_TYPE_OPTIONS } from '../constants';
import { ArrowRight, ArrowLeft, MapPin, DollarSign, Navigation, UtensilsCrossed } from 'lucide-react';

interface FiltersStepProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FiltersStep({ filters, setFilters, onNext, onBack }: FiltersStepProps) {
  const avgPerMeal = Math.round(filters.budget / 21);
  const totalMeals = 21; // 7 days × 3 meals

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 flex items-center justify-center p-6">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl animate-pulse-soft delay-300"></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-pulse-soft delay-500"></div>
      </div>

      <div className="glass rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-scale-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Budget & Location
          </h2>
          <p className="text-gray-600">
            Set your weekly budget and dining preferences for {totalMeals} meals
          </p>
        </div>

        <div className="space-y-6">
          {/* Location */}
          <div className="glass-dark rounded-2xl p-6 animate-fade-in-up">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <MapPin className="w-5 h-5 text-orange-500" />
              Location
            </label>
            <input 
              type="text" 
              value={filters.location} 
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Enter city or zip code"
              className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 
                         focus:border-orange-400 focus:shadow-lg focus:outline-none 
                         placeholder-gray-400 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll find restaurants near this location
            </p>
          </div>

          {/* Budget */}
          <div className="glass-dark rounded-2xl p-6 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <DollarSign className="w-5 h-5 text-green-500" />
                Weekly Budget
              </label>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">${filters.budget}</div>
                <div className="text-xs text-gray-500">~${avgPerMeal}/meal</div>
              </div>
            </div>
            <input 
              type="range" 
              min="150" 
              max="700" 
              step="25"
              value={filters.budget} 
              onChange={(e) => setFilters({ ...filters, budget: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer 
                         accent-orange-500 transition-all"
              style={{
                background: `linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(249, 115, 22) ${((filters.budget - 150) / (700 - 150)) * 100}%, rgb(229, 231, 235) ${((filters.budget - 150) / (700 - 150)) * 100}%, rgb(229, 231, 235) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>$150</span>
              <span>$700</span>
            </div>
            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Planning for:</span> 7 days × 3 meals = {totalMeals} meals total
              </p>
            </div>
          </div>

          {/* Distance */}
          <div className="glass-dark rounded-2xl p-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <Navigation className="w-5 h-5 text-blue-500" />
                Max Distance
              </label>
              <span className="text-xl font-bold text-gray-800">{filters.distance} mi</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="25" 
              step="1"
              value={filters.distance} 
              onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer 
                         accent-blue-500 transition-all"
              style={{
                background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${((filters.distance - 1) / 24) * 100}%, rgb(229, 231, 235) ${((filters.distance - 1) / 24) * 100}%, rgb(229, 231, 235) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 mile</span>
              <span>25 miles</span>
            </div>
          </div>

          {/* Meal Type */}
          <div className="glass-dark rounded-2xl p-6 animate-fade-in-up delay-300">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <UtensilsCrossed className="w-5 h-5 text-purple-500" />
              Meal Type Preference
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MEAL_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, mealType: option.value })}
                  className={`p-4 rounded-xl text-sm font-medium transition-all hover-lift ${
                    filters.mealType === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg'
                      : 'glass hover:bg-white/80 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div>{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <button 
            onClick={onBack}
            className="flex-1 glass px-6 py-4 rounded-xl font-semibold text-gray-700 
                       hover:bg-white/80 transition-all hover-lift flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button 
            onClick={onNext}
            disabled={!filters.location.trim()}
            className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-4 rounded-xl 
                       font-semibold hover:from-orange-600 hover:to-rose-600 
                       disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                       transition-all shadow-lg hover:shadow-xl hover-lift flex items-center justify-center gap-2"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}