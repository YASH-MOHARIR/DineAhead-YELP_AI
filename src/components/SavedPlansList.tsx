// components/SavedPlansList.tsx
import { useState } from 'react';
import  type { SavedPlan } from '../types';
import { DAYS } from '../constants';
import { getSavedPlans, deletePlanFromStorage } from '../utils/storage';

interface SavedPlansListProps {
  onLoad: (plan: SavedPlan) => void;
  onClose: () => void;
}

export default function SavedPlansList({ onLoad, onClose }: SavedPlansListProps) {
  const [plans, setPlans] = useState<SavedPlan[]>(getSavedPlans());

  const handleDelete = (id: string) => {
    deletePlanFromStorage(id);
    setPlans(getSavedPlans());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">📚 Saved Plans</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <div className="overflow-y-auto max-h-96 p-4">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-500">No saved plans yet</p>
              <p className="text-sm text-gray-400 mt-1">Create a meal plan and save it!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map(savedPlan => (
                <div key={savedPlan.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{savedPlan.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(savedPlan.createdAt).toLocaleDateString()} • 📍 {savedPlan.location}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-orange-600">${savedPlan.totalCost}</span>
                  </div>
                  
                  {/* Days progress bar */}
                  <div className="flex gap-1 mb-3">
                    {DAYS.map(day => (
                      <div 
                        key={day} 
                        className={`flex-1 h-2 rounded ${
                          savedPlan.plan[day] ? 'bg-orange-400' : 'bg-gray-200'
                        }`}
                        title={savedPlan.plan[day]?.restaurant.name || 'Empty'}
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLoad(savedPlan)}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                    >
                      Load Plan
                    </button>
                    <button 
                      onClick={() => handleDelete(savedPlan.id)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}