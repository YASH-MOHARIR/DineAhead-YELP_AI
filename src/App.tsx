// App.tsx - Main application component
import { useState } from 'react';
import type { AppStep, UserPreferences, Filters, WeeklyPlanType, SavedPlan, Restaurant } from './types';
import { DAYS } from './constants';
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
    budget: 150, 
    distance: 5, 
    mealType: 'any' 
  });
  const [plan, setPlan] = useState<WeeklyPlanType>({ 
    monday: null, 
    tuesday: null, 
    wednesday: null, 
    thursday: null, 
    friday: null 
  });
  const [showSummary, setShowSummary] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);

  // Check if plan has any restaurants
  const hasPlan = DAYS.some(d => plan[d] !== null);
  
  // Calculate total cost
  const totalCost = DAYS.reduce((sum, d) => sum + (plan[d]?.restaurant.estimatedCost || 0), 0);

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

  // FIX: Navigate to planning view and ensure summary is hidden
  const handleStartPlanning = () => {
    setShowSummary(false); // Ensure we show PlanningView, not Summary
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
          onNext={handleStartPlanning}  // FIX: Use new handler
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

      {/* Restaurant Detail Modal - available app-wide */}
      {viewingRestaurant && (
        <RestaurantDetailModal
          restaurant={viewingRestaurant}
          onClose={() => setViewingRestaurant(null)}
          onAddToDay={(day) => {
            setPlan({ ...plan, [day]: { restaurant: viewingRestaurant, dishes: [] } });
            setViewingRestaurant(null);
          }}
          preferences={preferences}
          filters={filters}
        />
      )}
    </div>
  );
}