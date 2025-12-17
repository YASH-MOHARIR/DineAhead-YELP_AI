// constants.ts - App constants and options
import type { DietaryType, DayOfWeek, MealTime } from './types';

export const API_KEY = import.meta.env.VITE_YELP_API_KEY || 'YOUR_API_KEY_HERE';

export const DIETARY_OPTIONS: { value: DietaryType; label: string }[] = [
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

export const ALLERGEN_OPTIONS = [
  'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 
  'Dairy', 'Eggs', 'Gluten', 'Soy', 'Sesame'
];

export const CUISINE_OPTIONS = [
  'American', 'Chinese', 'Indian', 'Italian', 'Japanese', 
  'Korean', 'Mexican', 'Thai', 'Vietnamese', 'Mediterranean', 
  'French', 'Greek', 'Middle Eastern'
];

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner'];

export const DAY_LABELS: Record<DayOfWeek, { short: string; full: string }> = {
  monday: { short: 'Mon', full: 'Monday' },
  tuesday: { short: 'Tue', full: 'Tuesday' },
  wednesday: { short: 'Wed', full: 'Wednesday' },
  thursday: { short: 'Thu', full: 'Thursday' },
  friday: { short: 'Fri', full: 'Friday' },
  saturday: { short: 'Sat', full: 'Saturday' },
  sunday: { short: 'Sun', full: 'Sunday' }
};

export const MEAL_ICONS: Record<MealTime, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙'
};

export const DAY_OFFSETS: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
};

export const MEAL_TIMES_HOURS: Record<MealTime, { start: number; end: number }> = {
  breakfast: { start: 8, end: 9 },
  lunch: { start: 12, end: 13 },
  dinner: { start: 19, end: 21 }
};

export const PRICE_MAP: Record<string, number> = {
  '$': 12,
  '$$': 22,
  '$$$': 38,
  '$$$$': 55
};

// Budget ranges for different meal times (used for smart suggestions)
export const MEAL_PRICE_TARGETS: Record<MealTime, { min: number; ideal: number; max: number }> = {
  breakfast: { min: 8, ideal: 12, max: 18 },
  lunch: { min: 12, ideal: 20, max: 30 },
  dinner: { min: 18, ideal: 32, max: 55 }
};