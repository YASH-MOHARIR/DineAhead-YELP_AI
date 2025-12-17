// utils/matching.ts - Preference matching logic
import type  { Restaurant, UserPreferences, Filters, MatchIndicator, DietaryType, ReviewSnippet } from '../types';

const DIETARY_KEYWORDS: Record<DietaryType, string[]> = {
  'vegetarian': ['vegetarian', 'vegan', 'veggie', 'plant'],
  'vegan': ['vegan', 'plant-based', 'plant'],
  'non-vegetarian': ['steakhouse', 'bbq', 'burger', 'chicken', 'seafood', 'meat'],
  'pescatarian': ['seafood', 'fish', 'sushi', 'poke'],
  'halal': ['halal', 'middle eastern', 'mediterranean', 'turkish'],
  'kosher': ['kosher', 'jewish', 'deli'],
};

export function getMatchIndicators(
  restaurant: Restaurant, 
  preferences: UserPreferences, 
  filters: Filters
): MatchIndicator[] {
  const indicators: MatchIndicator[] = [];
  const cuisineLower = restaurant.cuisine.toLowerCase();
  const budgetPerMeal = filters.budget / 5;
  
  // Dietary match
  if (preferences.dietary) {
    const keywords = DIETARY_KEYWORDS[preferences.dietary] || [];
    const matched = keywords.some(k => cuisineLower.includes(k)) || 
      restaurant.summaries.short.toLowerCase().includes(preferences.dietary);
    indicators.push({ label: preferences.dietary, matched, icon: matched ? '✓' : '?' });
  }

  // Cuisine preference match
  const likedMatch = preferences.cuisineLikes.find(c => cuisineLower.includes(c.toLowerCase()));
  if (likedMatch) {
    indicators.push({ label: likedMatch, matched: true, icon: '♥' });
  }
  
  // Disliked cuisine warning
  const dislikedMatch = preferences.cuisineDislikes.find(c => cuisineLower.includes(c.toLowerCase()));
  if (dislikedMatch) {
    indicators.push({ label: `Not ${dislikedMatch}`, matched: false, icon: '✗' });
  }

  // Budget match
  const withinBudget = restaurant.estimatedCost <= budgetPerMeal;
  indicators.push({ 
    label: `$${restaurant.estimatedCost}/meal`, 
    matched: withinBudget, 
    icon: withinBudget ? '✓' : '⚠' 
  });

  // Distance match
  if (restaurant.distanceNum > 0) {
    const withinDistance = restaurant.distanceNum <= filters.distance;
    indicators.push({ 
      label: restaurant.distance, 
      matched: withinDistance, 
      icon: withinDistance ? '✓' : '⚠' 
    });
  }

  // Rating indicator
  if (restaurant.rating >= 4.5) {
    indicators.push({ label: 'Top Rated', matched: true, icon: '★' });
  }

  return indicators;
}

export function getMatchScore(
  restaurant: Restaurant, 
  preferences: UserPreferences, 
  filters: Filters
): number {
  const indicators = getMatchIndicators(restaurant, preferences, filters);
  const matched = indicators.filter(i => i.matched).length;
  return Math.round((matched / Math.max(indicators.length, 1)) * 100);
}

// ⭐ ENHANCED: Group reviews by rating with proportional sampling
export function groupReviewsByRating(snippets: ReviewSnippet[]): { 
  rating: number; 
  reviews: ReviewSnippet[]; 
  percentage: number;
  sampleSize: number;
}[] | null {
  const withRatings = snippets.filter(s => s.rating !== null);
  if (withRatings.length === 0) return null;
  
  const groups: Record<number, ReviewSnippet[]> = { 5: [], 4: [], 3: [], 2: [], 1: [] };
  withRatings.forEach(s => {
    const r = Math.min(5, Math.max(1, Math.round(s.rating!)));
    groups[r].push(s);
  });
  
  const total = withRatings.length || 1;
  
  // Calculate proportional sample sizes (target: 50 reviews if available)
  const targetSampleSize = Math.min(50, total);
  
  return [5, 4, 3, 2, 1]
    .map(rating => {
      const reviews = groups[rating];
      const percentage = Math.round((reviews.length / total) * 100);
      // Proportional sampling: if this rating has 50% of reviews, take 50% of target sample
      const sampleSize = Math.round((reviews.length / total) * targetSampleSize);
      
      return { 
        rating, 
        reviews: reviews.slice(0, sampleSize), // Take proportional sample
        percentage,
        sampleSize
      };
    })
    .filter(g => g.reviews.length > 0);
}

// ⭐ NEW: Get review summary statistics
export function getReviewSummary(snippets: ReviewSnippet[]): {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
} | null {
  const withRatings = snippets.filter(s => s.rating !== null);
  if (withRatings.length === 0) return null;
  
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  
  withRatings.forEach(s => {
    const r = Math.min(5, Math.max(1, Math.round(s.rating!)));
    distribution[r]++;
    sum += s.rating!;
  });
  
  return {
    averageRating: sum / withRatings.length,
    totalReviews: withRatings.length,
    distribution
  };
}