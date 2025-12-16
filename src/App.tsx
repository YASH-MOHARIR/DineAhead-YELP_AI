// App.tsx - Main application component
import { useState } from 'react';
import type { AppStep, UserPreferences, Filters, WeeklyPlanType, SavedPlan, Restaurant, DayOfWeek, MealTime } from './types';
import { createEmptyWeek, MEAL_BUDGET_TARGETS } from './types';
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
    location: '02119', 
    budget: 350, // Higher default for 21 meals
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
  
  // Calculate total cost
  const totalCost = DAYS.reduce((sum, d) => {
    return sum + MEAL_TIMES.reduce((mealSum, m) => {
      return mealSum + (plan[d][m]?.restaurant.estimatedCost || 0);
    }, 0);
  }, 0);

  // Count planned meals
  const plannedMeals = DAYS.reduce((sum, d) => {
    return sum + MEAL_TIMES.filter(m => plan[d][m] !== null).length;
  }, 0);

  // Save plan handler
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
      
      {step === 'plan' && !showSummary && (
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
          onEdit={() => setShowSummary(false)}
          onSave={handleSavePlan}
          onViewRestaurant={setViewingRestaurant}
        />
      )}
      
      {/* Saved Plans Modal */}
      {showSavedPlans && (
        <SavedPlansList 
          onLoad={handleLoadPlan}
          onClose={() => setShowSavedPlans(false)}
        />
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