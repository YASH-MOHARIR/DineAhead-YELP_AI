// components/SavedPlansList.tsx
import { useState } from 'react';
import type { SavedPlan } from '../types';
import { DAYS } from '../constants';
import { getSavedPlans, deletePlanFromStorage } from '../utils/storage';
import { BookOpen, X, MapPin, Trash2, FolderOpen } from 'lucide-react';

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
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" /> Saved Plans
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-96 p-4">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No saved plans yet</p>
              <p className="text-sm text-gray-400 mt-1">Create a meal plan and save it!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map(savedPlan => {
                const filledDays = DAYS.filter(d => savedPlan.plan[d]).length;
                return (
                  <div key={savedPlan.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{savedPlan.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {new Date(savedPlan.createdAt).toLocaleDateString()} 
                          <span>•</span>
                          <MapPin className="w-3 h-3" /> {savedPlan.location}
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
                            savedPlan.plan[day] ? 'bg-gradient-to-r from-orange-400 to-rose-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{filledDays}/5 days planned</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onLoad(savedPlan)}
                        className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white 
                                   rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-all text-sm"
                      >
                        Load Plan
                      </button>
                      <button 
                        onClick={() => handleDelete(savedPlan.id)}
                        className="px-3 py-2 border border-red-200 text-red-500 rounded-lg 
                                   hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}