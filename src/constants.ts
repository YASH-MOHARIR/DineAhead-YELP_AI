// constants.ts - Application constants
// constants.ts - Application constants

import type { DayOfWeek, MealTime } from './types';

export const API_KEY = import.meta.env.VITE_YELP_API_KEY || 'YOUR_API_KEY_HERE';

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

export const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner'];

export const MEAL_ICONS: Record<MealTime, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙'
};

export const MEAL_LABELS: Record<MealTime, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner'
};

// Budget targets for each meal type
export const MEAL_PRICE_TARGETS: Record<MealTime, { min: number; max: number }> = {
  breakfast: { min: 8, max: 18 },
  lunch: { min: 12, max: 28 },
  dinner: { min: 18, max: 55 }
};

export const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian 🥗', emoji: '🥗' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian 🍖', emoji: '🍖' },
  { value: 'vegan', label: 'Vegan 🌱', emoji: '🌱' },
  { value: 'pescatarian', label: 'Pescatarian 🐟', emoji: '🐟' },
  { value: 'halal', label: 'Halal ☪️', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher ✡️', emoji: '✡️' }
] as const;

export const ALLERGEN_OPTIONS = [
  'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 
  'Dairy', 'Eggs', 'Gluten', 'Soy', 'Sesame'
];

export const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Japanese', 'Thai', 'Indian', 'Mexican', 'Mediterranean',
  'American', 'French', 'Korean', 'Vietnamese', 'Greek', 'Middle Eastern', 'Spanish'
];

export const MEAL_TYPE_OPTIONS = [
  { value: 'any', label: 'All types', icon: '🍽️' },
  { value: 'dine-in', label: 'Dine-in only', icon: '🪑' },
  { value: 'takeout', label: 'Takeout only', icon: '🥡' },
  { value: 'delivery', label: 'Delivery only', icon: '🚚' }
] as const;
 
export const PRICE_MAP: Record<string, number> = {
  '$': 12,
  '$$': 22,
  '$$$': 35,
  '$$$$': 55
};