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
  phone?: string;
  imageUrl: string;
  photos: string[];
  reviewSnippets: ReviewSnippet[];
  supportsReservation?: boolean;
  categories?: string[];
  hours?: string[];
  attributes?: string[];
}

// NEW: Meal slot for a specific meal time
export interface MealSlot {
  restaurant: Restaurant;
  dishes: string[];
}

// NEW: Day plan with breakfast, lunch, and dinner
export interface DayPlan {
  breakfast: MealSlot | null;
  lunch: MealSlot | null;
  dinner: MealSlot | null;
}

// NEW: Weekly plan with 7 days × 3 meals
export interface WeeklyPlanType {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  restaurants?: Restaurant[];
  suggestedPlan?: Partial<WeeklyPlanType>;
  timestamp: Date;
}

// Helper to create empty week
export function createEmptyWeek(): WeeklyPlanType {
  const emptyDay: DayPlan = { breakfast: null, lunch: null, dinner: null };
  return {
    monday: { ...emptyDay },
    tuesday: { ...emptyDay },
    wednesday: { ...emptyDay },
    thursday: { ...emptyDay },
    friday: { ...emptyDay },
    saturday: { ...emptyDay },
    sunday: { ...emptyDay }
  };
}