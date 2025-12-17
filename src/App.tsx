// App.tsx - Main application component
import { useState } from 'react';
import type { AppStep, UserPreferences, Filters, WeeklyPlanType, SavedPlan, Restaurant, DayOfWeek, MealTime } from './types';
import { createEmptyWeek } from './types';
import { DAYS, MEAL_TIMES } from './constants';
import { getSavedPlans, savePlanToStorage } from './utils/storage';

// Components
import Landing from './components/Landing';
import Preferences from './components/Preferences';
import FiltersStep from './components/FiltersStep';
import PlanningView from './components/PlanningView';
import PlanSummary from './components/PlanSummary';
import SavedPlansList from './components/SavedPlansList';
import RestaurantDetailModal from './components/RestaurantDetailModal';

export default function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [preferences, setPreferences] = useState<UserPreferences>({ 
    dietary: null, 
    allergens: [], 
    cuisineLikes: [], 
    cuisineDislikes: [] 
  });
  const [filters, setFilters] = useState<Filters>({ 
    location: '', 
    budget: 350,
    distance: 5, 
    mealType: 'any' 
  });
  const [plan, setPlan] = useState<WeeklyPlanType>(createEmptyWeek());
  const [showSummary, setShowSummary] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);

  // Calculate if plan has any restaurants
  const hasPlan = DAYS.some(d => 
    MEAL_TIMES.some(m => plan[d][m] !== null)
  );
  
  // Calculate total cost - FIXED to handle null restaurants
  const totalCost = DAYS.reduce((sum, d) => {
    return sum + MEAL_TIMES.reduce((mealSum, m) => {
      const mealSlot = plan[d][m];
      return mealSum + (mealSlot?.restaurant?.estimatedCost || 0);
    }, 0);
  }, 0);

  // Save plan handler - FIXED to show saved plans after save
  const handleSavePlan = (name: string) => {
    const savedPlan: SavedPlan = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      location: filters.location,
      budget: filters.budget,
      plan,
      totalCost
    };
    savePlanToStorage(savedPlan);
    
    // Show saved plans after saving
    setShowSummary(false);
    setShowSavedPlans(true);
  };

  // Load plan handler
  const handleLoadPlan = (savedPlan: SavedPlan) => {
    setPlan(savedPlan.plan);
    setFilters(f => ({ ...f, location: savedPlan.location, budget: savedPlan.budget }));
    setShowSavedPlans(false);
    setShowSummary(true);
    setStep('plan');
  };

  // Navigate to planning view
  const handleStartPlanning = () => {
    setShowSummary(false);
    setStep('plan');
  };

  // Create new plan
  const handleCreateNewPlan = () => {
    setPlan(createEmptyWeek());
    setShowSavedPlans(false);
    setShowSummary(false);
    setStep('landing');
  };

  // Back to chat from saved plans
  const handleBackToChat = () => {
    setShowSavedPlans(false);
    setStep('plan');
  };

  return (
    <div className="font-sans">
      {step === 'landing' && (
        <Landing 
          onStart={() => setStep('preferences')} 
          savedPlansCount={getSavedPlans().length}
          onShowSavedPlans={() => setShowSavedPlans(true)}
        />
      )}
      
      {step === 'preferences' && (
        <Preferences 
          preferences={preferences} 
          setPreferences={setPreferences} 
          onNext={() => setStep('filters')} 
          onBack={() => setStep('landing')} 
        />
      )}
      
      {step === 'filters' && (
        <FiltersStep 
          filters={filters} 
          setFilters={setFilters} 
          onNext={handleStartPlanning}
          onBack={() => setStep('preferences')} 
        />
      )}
      
      {step === 'plan' && !showSummary && !showSavedPlans && (
        <PlanningView 
          plan={plan} 
          setPlan={setPlan} 
          preferences={preferences} 
          filters={filters} 
          onBack={() => setStep('filters')}
          onFinish={() => setShowSummary(true)}
          hasPlan={hasPlan}
        />
      )}
      
      {step === 'plan' && showSummary && (
        <PlanSummary 
          plan={plan} 
          filters={filters} 
          onBack={() => setShowSummary(false)}
          onSave={handleSavePlan}
          onViewRestaurant={setViewingRestaurant}
        />
      )}
      
      {/* Saved Plans Modal */}
      {showSavedPlans && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-rose-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📚 Saved Meal Plans</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {getSavedPlans().length} saved plan{getSavedPlans().length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button 
                  onClick={() => setShowSavedPlans(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Plans List */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              <SavedPlansList 
                onLoad={handleLoadPlan}
                onClose={() => setShowSavedPlans(false)}
              />
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleCreateNewPlan}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl 
                             font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg
                             flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  <span>Create New Plan</span>
                </button>
                {hasPlan && (
                  <button
                    onClick={handleBackToChat}
                    className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-semibold 
                               border-2 border-gray-200 hover:bg-gray-50 transition-all
                               flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>Back to Chat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Detail Modal */}
      {viewingRestaurant && (
        <RestaurantDetailModal
          restaurant={viewingRestaurant}
          onClose={() => setViewingRestaurant(null)}
          onAddToDay={(day: DayOfWeek, meal: MealTime) => {
            const newPlan = { ...plan };
            newPlan[day] = { 
              ...newPlan[day], 
              [meal]: { restaurant: viewingRestaurant, mealTime: meal } 
            };
            setPlan(newPlan);
            setViewingRestaurant(null);
          }}
          preferences={preferences}
          filters={filters}
        />
      )}
    </div>
  );
}