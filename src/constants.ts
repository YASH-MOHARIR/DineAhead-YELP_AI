// constants.ts - App constants and options
import type { DietaryType, DayOfWeek } from './types';

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

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export const DAY_OFFSETS: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4
};

export const PRICE_MAP: Record<string, number> = {
  '$': 12,
  '$$': 22,
  '$$$': 35,
  '$$$$': 55
};