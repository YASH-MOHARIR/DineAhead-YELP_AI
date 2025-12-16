// types.ts - All TypeScript interfaces and types

export type DietaryType = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'pescatarian' | 'halal' | 'kosher';
export type MealType = 'takeout' | 'dine-in' | 'delivery' | 'any';
export type MealTime = 'breakfast' | 'lunch' | 'dinner';
export type AppStep = 'landing' | 'preferences' | 'filters' | 'plan';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface UserPreferences {
  dietary: DietaryType | null;
  allergens: string[];
  cuisineLikes: string[];
  cuisineDislikes: string[];
}

export interface Filters {
  location: string;
  budget: number;
  distance: number;
  mealType: MealType;
}

export interface ReviewSnippet {
  text: string;
  rating: number | null;
}

export interface MatchIndicator {
  label: string;
  matched: boolean;
  icon: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  estimatedCost: number;
  distance: string;
  distanceNum: number;
  address: string;
  imageUrl: string;
  yelpUrl: string;
  summaries: { short: string; medium: string; long: string };
  reviewSnippets: ReviewSnippet[];
  contextualSummary: string;
  photos: string[];
  phone: string;
  supportsReservation: boolean;
  reservationUrl: string | null;
}

export interface MealSlot {
  restaurant: Restaurant;
  mealTime: MealTime;
}

export interface DayPlan {
  breakfast: MealSlot | null;
  lunch: MealSlot | null;
  dinner: MealSlot | null;
}

export interface WeeklyPlanType {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  restaurants?: Restaurant[];
  suggestedPlan?: Partial<WeeklyPlanType>;
  timestamp: Date;
}

export interface SavedPlan {
  id: string;
  name: string;
  createdAt: string;
  location: string;
  budget: number;
  plan: WeeklyPlanType;
  totalCost: number;
}

// Budget targets per meal type
export const MEAL_BUDGET_TARGETS: Record<MealTime, { min: number; max: number; label: string }> = {
  breakfast: { min: 8, max: 18, label: '🌅 Breakfast' },
  lunch: { min: 12, max: 28, label: '☀️ Lunch' },
  dinner: { min: 18, max: 55, label: '🌙 Dinner' }
};

// Helper to create empty day plan
export const createEmptyDayPlan = (): DayPlan => ({
  breakfast: null,
  lunch: null,
  dinner: null
});

// Helper to create empty week
export const createEmptyWeek = (): WeeklyPlanType => ({
  monday: createEmptyDayPlan(),
  tuesday: createEmptyDayPlan(),
  wednesday: createEmptyDayPlan(),
  thursday: createEmptyDayPlan(),
  friday: createEmptyDayPlan(),
  saturday: createEmptyDayPlan(),
  sunday: createEmptyDayPlan()
});