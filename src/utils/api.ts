// utils/api.ts - Yelp API with proper multi-turn conversation support
import type { Restaurant, ReviewSnippet } from '../types';
import { API_KEY, PRICE_MAP } from '../constants';

export interface ChatResponse {
  response: {
    text: string;
    tags?: Array<{
      tag_type: string;
      start: number;
      end: number;
      meta: { business_id: string };
    }>;
  };
  types?: string[];
  entities?: any;
  chat_id?: string;
}

export interface UserContext {
  locale?: string;
  latitude?: number;
  longitude?: number;
}

export async function searchRestaurants(
  query: string, 
  location: string, 
  chatId?: string,
  userContext?: UserContext
): Promise<ChatResponse> {
  const body: Record<string, any> = { 
    query,
    location
  };
  
  // Include chat_id for multi-turn context
  if (chatId) {
    body.chat_id = chatId;
    console.log('🔄 Multi-turn request with chat_id:', chatId);
  } else {
    console.log('🆕 New conversation (no chat_id)');
  }

  // Include user_context for better location-based results
  if (userContext) {
    body.user_context = userContext;
  }

  console.log('📤 Request body:', JSON.stringify(body, null, 2));

  const response = await fetch('/api/yelp/ai/chat/v2', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${API_KEY}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Yelp API error:', response.status, errorText);
    throw new Error(`Yelp API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('📥 Response chat_id:', data.chat_id);
  console.log('📥 Response types:', data.types);
  
  return data;
}

function parseReviewSnippets(contextualInfo: any): ReviewSnippet[] {
  const snippets: ReviewSnippet[] = [];
  if (contextualInfo?.review_snippet) {
    snippets.push({ 
      text: contextualInfo.review_snippet
        .replace(/\[\[HIGHLIGHT\]\]/g, '')
        .replace(/\[\[ENDHIGHLIGHT\]\]/g, ''), 
      rating: null
    });
  }
  if (contextualInfo?.review_snippets?.length) {
    contextualInfo.review_snippets.forEach((s: any) => {
      const text = (s.comment || s.text || '')
        .replace(/\[\[HIGHLIGHT\]\]/g, '')
        .replace(/\[\[ENDHIGHLIGHT\]\]/g, '');
      if (text) snippets.push({ 
        text, 
        rating: typeof s.rating === 'number' ? s.rating : null
      });
    });
  }
  return snippets.slice(0, 5);
}

function extractPhotos(business: any): string[] {
  const photos: string[] = [];
  if (business.image_url) photos.push(business.image_url);
  if (business.contextual_info?.photos) {
    business.contextual_info.photos.forEach((p: any) => {
      if (p.original_url) photos.push(p.original_url);
      else if (p.url) photos.push(p.url);
    });
  }
  if (business.photos) photos.push(...business.photos);
  return [...new Set(photos)].slice(0, 6);
}

// Estimate cost from price level
function estimateCost(price: string | null | undefined): number {
  if (!price) {
    return 20; // Default mid-range if no price data
  }
  const level = price.length;
  switch (level) {
    case 1: return 12;  // $
    case 2: return 22;  // $$
    case 3: return 35;  // $$$
    case 4: return 55;  // $$$$
    default: return PRICE_MAP[price] || 20;
  }
}

export function transformYelpBusiness(business: any): Restaurant {
  const id = business.id || 'restaurant-' + Math.random().toString(36).substr(2, 9);
  const distanceNum = business.distance ? business.distance / 1609.34 : 0;
  const transactions = business.transactions || [];
  const supportsReservation = transactions.includes('restaurant_reservation');
  
  // Better price handling - check multiple locations
  const priceLevel = business.price || 
                     business.contextual_info?.price || 
                     null;
  
  return {
    id,
    name: business.name || 'Unknown Restaurant',
    cuisine: business.categories?.[0]?.title || 'Restaurant',
    rating: business.rating || 0,
    reviewCount: business.review_count || 0,
    priceLevel: priceLevel || '$$',
    estimatedCost: estimateCost(priceLevel),
    distance: distanceNum ? distanceNum.toFixed(1) + ' mi' : 'N/A',
    distanceNum,
    address: business.location?.formatted_address || 
             business.location?.address1 || 
             'Address not available',
    imageUrl: business.image_url || 
              business.contextual_info?.photos?.[0]?.original_url || 
              `https://picsum.photos/seed/${id}/300/200`,
    yelpUrl: business.url || '#',
    summaries: {
      short: business.summaries?.short || 
             business.attributes?.biz_summary?.summary || '',
      medium: business.summaries?.medium || '',
      long: business.summaries?.long || '',
    },
    reviewSnippets: parseReviewSnippets(business.contextual_info),
    contextualSummary: business.contextual_info?.summary || '',
    photos: extractPhotos(business),
    phone: business.phone || business.display_phone || '',
    supportsReservation,
    reservationUrl: supportsReservation 
      ? `https://www.yelp.com/reservations/${business.alias || id}` 
      : null,
  };
}