// components/FiltersStep.tsx
import  type { Filters } from '../types';

interface FiltersStepProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FiltersStep({ filters, setFilters, onNext, onBack }: FiltersStepProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-gray-500 mb-4 hover:text-gray-700">← Back</button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">This Week's Plan</h1>
        <p className="text-gray-600 mb-8">Set your budget and location</p>

        {/* Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">📍 Location</h2>
          <input 
            type="text" 
            placeholder="Enter city or zip code" 
            value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none" 
          />
        </div>

        {/* Budget */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">💰 Weekly Budget</h2>
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-orange-500">${filters.budget}</span>
            <span className="text-gray-500 ml-2">/ week</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="300" 
            step="10" 
            value={filters.budget}
            onChange={e => setFilters({ ...filters, budget: Number(e.target.value) })} 
            className="w-full accent-orange-500" 
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>$50</span>
            <span>$300</span>
          </div>
        </div>

        {/* Distance */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">🚗 Distance</h2>
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-gray-700">{filters.distance} miles</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            value={filters.distance}
            onChange={e => setFilters({ ...filters, distance: Number(e.target.value) })} 
            className="w-full accent-orange-500" 
          />
        </div>

        <button 
          onClick={onNext} 
          disabled={!filters.location}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Start Planning with AI 🤖
        </button>
      </div>
    </div>
  );
}