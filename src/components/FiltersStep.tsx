// components/FiltersStep.tsx
import type { Filters } from '../types';

interface FiltersStepProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FiltersStep({ filters, setFilters, onNext, onBack }: FiltersStepProps) {
  const mealsPerWeek = 21;
  const avgPerMeal = Math.round(filters.budget / mealsPerWeek);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 p-6">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <button onClick={onBack} className="glass px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 mb-4 transition-all">
          ← Back
        </button>
        
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Plan Your Week</h1>
          <p className="text-gray-600">Set your budget and location for 21 meals</p>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📍</span> Location
          </h2>
          <input 
            type="text" 
            placeholder="Enter zip code or city" 
            value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none
                       transition-all text-lg" 
          />
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up delay-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span> Weekly Budget
          </h2>
          
          <div className="text-center mb-4">
            <span className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              ${filters.budget}
            </span>
            <span className="text-gray-500 ml-2">/ week</span>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-3 mb-4 text-center">
            <p className="text-sm text-orange-700">
              <strong>~${avgPerMeal}</strong> per meal average
              <span className="mx-2">•</span>
              <strong>{mealsPerWeek}</strong> meals total
            </p>
          </div>
          
          <input 
            type="range" 
            min="150" 
            max="700" 
            step="25" 
            value={filters.budget}
            onChange={e => setFilters({ ...filters, budget: Number(e.target.value) })} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>$150 (~$7/meal)</span>
            <span>$700 (~$33/meal)</span>
          </div>
        </div>

        {/* Distance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up delay-200">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🚗</span> Distance
          </h2>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-gray-700">{filters.distance}</span>
            <span className="text-gray-500 ml-2">miles</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={filters.distance}
            onChange={e => setFilters({ ...filters, distance: Number(e.target.value) })} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
          />
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl p-4 mb-6 animate-fade-in-up delay-300">
          <h3 className="font-semibold text-gray-800 mb-2">📊 Your Plan Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">7</p>
              <p className="text-xs text-gray-600">Days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">21</p>
              <p className="text-xs text-gray-600">Meals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">${avgPerMeal}</p>
              <p className="text-xs text-gray-600">Avg/meal</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onNext} 
          disabled={!filters.location}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-xl 
                     font-semibold text-lg shadow-lg hover:shadow-xl transition-all
                     hover:-translate-y-0.5 disabled:from-gray-300 disabled:to-gray-300 
                     disabled:cursor-not-allowed flex items-center justify-center gap-2
                     animate-fade-in-up delay-400"
        >
          <span>Start Planning with AI</span>
          <span className="text-xl">🤖</span>
        </button>
      </div>
    </div>
  );
}