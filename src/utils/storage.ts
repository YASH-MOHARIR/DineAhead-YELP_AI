// utils/storage.ts - LocalStorage helpers for saved plans
import type { SavedPlan } from '../types';

const STORAGE_KEY = 'dineahead_plans';
const MAX_PLANS = 10;

export function getSavedPlans(): SavedPlan[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function savePlanToStorage(plan: SavedPlan): void {
  const plans = getSavedPlans();
  plans.unshift(plan); // Add to beginning
  if (plans.length > MAX_PLANS) plans.pop(); // Keep max plans
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function deletePlanFromStorage(id: string): void {
  const plans = getSavedPlans().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function clearAllPlans(): void {
  localStorage.removeItem(STORAGE_KEY);
}