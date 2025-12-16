// types.ts - All TypeScript interfaces and types

export type DietaryType = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'pescatarian' | 'halal' | 'kosher';
export type MealType = 'takeout' | 'dine-in' | 'delivery' | 'any';
export type AppStep = 'landing' | 'preferences' | 'filters' | 'plan';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

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

export interface DayPlan {
  restaurant: Restaurant;
  dishes: string[];
}

export interface WeeklyPlanType {
  monday: DayPlan | null;
  tuesday: DayPlan | null;
  wednesday: DayPlan | null;
  thursday: DayPlan | null;
  friday: DayPlan | null;
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