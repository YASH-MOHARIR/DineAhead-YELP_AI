// components/PlanningView.tsx
import { useState, type DragEvent } from 'react';
import type { WeeklyPlanType, UserPreferences, Filters, ChatMessage, Restaurant, DayOfWeek, MealTime } from '../types';
import { DAYS, DAY_LABELS, MEAL_ICONS, MEAL_PRICE_TARGETS } from '../constants';
import { searchRestaurants, transformYelpBusiness } from '../utils/api';
import ChatAssistant from './ChatAssistant';
import WeeklyPlanDisplay from './WeeklyPlanDisplay';
import RestaurantDetailModal from './RestaurantDetailModal';

interface PlanningViewProps {
  plan: WeeklyPlanType;
  setPlan: (p: WeeklyPlanType) => void;
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  onBack: () => void;
  onFinish: () => void;
  hasPlan: boolean;
}

// ⭐ ENHANCED: Include ALL user details in queries
function buildFullQuery(userMessage: string, preferences: UserPreferences, filters: Filters): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Build context string with ALL details
  const buildContext = (includeBudget: boolean = false) => {
    let context = '';
    
    // Location and radius
    context += ` in ${filters.location} within ${filters.distance} miles`;
    
    // Dietary requirements
    if (preferences.dietary) {
      context += ` with ${preferences.dietary} options`;
    }
    
    // Allergens to AVOID
    if (preferences.allergens.length > 0) {
      context += `. Must avoid ${preferences.allergens.join(', ')}`;
    }
    
    // Cuisine preferences
    if (preferences.cuisineLikes.length > 0) {
      context += `. I prefer ${preferences.cuisineLikes.slice(0, 3).join(', ')} cuisine`;
    }
    
    // Cuisine dislikes
    if (preferences.cuisineDislikes.length > 0) {
      context += `. Avoid ${preferences.cuisineDislikes.slice(0, 2).join(' and ')} restaurants`;
    }
    
    // Budget context
    if (includeBudget) {
      const avgPerMeal = Math.round(filters.budget / 21);
      context += `. Budget around ${avgPerMeal} per meal`;
    }
    
    return context;
  };
  
  // Detect meal-specific requests
  const mealKeywords: Record<MealTime, string[]> = {
    breakfast: ['breakfast', 'brunch', 'morning', 'cafe', 'coffee'],
    lunch: ['lunch', 'midday', 'noon', 'quick bite'],
    dinner: ['dinner', 'evening', 'supper', 'night']
  };
  
  for (const [meal, keywords] of Object.entries(mealKeywords)) {
    if (keywords.some(k => lowerMessage.includes(k))) {
      const target = MEAL_PRICE_TARGETS[meal as MealTime];
      let query = `Find highly rated ${meal} restaurants`;
      query += buildContext(false);
      query += `. Price range ${target.min}-${target.max} per person`;
      query += `. ${userMessage}`;
      return query;
    }
  }
  
  // Plan entire day
  if (lowerMessage.includes('plan') && (lowerMessage.includes('day') || DAYS.some(d => lowerMessage.includes(d)))) {
    let query = `Find 3 highly rated restaurants for a full day`;
    query += buildContext(true);
    query += `. Need breakfast ($8-18), lunch ($12-28), and dinner ($18-55) options with variety`;
    return query;
  }
  
  // Plan entire week
  if (lowerMessage.includes('plan') && (lowerMessage.includes('week') || lowerMessage.includes('whole'))) {
    let query = `Recommend diverse highly rated restaurants for weekly meal planning`;
    query += buildContext(true);
    query += `. Show mix of breakfast ($8-18), lunch ($12-28), and dinner ($18-55) options`;
    return query;
  }
  
  // Budget requests
  if (lowerMessage.includes('cheap') || lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
    let query = `Find affordable highly rated restaurants under $15 per person`;
    query += buildContext(false);
    query += `. ${userMessage}`;
    return query;
  }
  
  // Fancy requests
  if (lowerMessage.includes('fancy') || lowerMessage.includes('nice') || lowerMessage.includes('special') || lowerMessage.includes('upscale')) {
    let query = `Find upscale fine dining restaurants`;
    query += buildContext(false);
    query += `. ${userMessage}`;
    return query;
  }
  
  // Default - include ALL context
  let query = `Find highly rated restaurants`;
  query += buildContext(true);
  query += `. ${userMessage}`;
  return query;
}

export default function PlanningView({ plan, setPlan, preferences, setPreferences, filters, setFilters, onBack, onFinish, hasPlan }: PlanningViewProps) {
  const avgPerMeal = Math.round(filters.budget / 21);
  
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1', 
    role: 'assistant',
    content: `Hi! I'm your DineAhead assistant 🍽️

I'll help you plan **breakfast, lunch & dinner** for the week in **${filters.location}**.

📊 **Your Budget:** $${filters.budget}/week (~$${avgPerMeal}/meal average)
${preferences.dietary ? `✓ **Diet:** ${preferences.dietary}` : ''}
${preferences.cuisineLikes.length ? `✓ **Favorites:** ${preferences.cuisineLikes.join(', ')}` : ''}

**Try asking:**
• "Plan Monday's meals"
• "Find breakfast spots"
• "Fancy dinner options"
• "Cheap lunch under $12"
• "Plan my whole week"

💡 I'll suggest a mix of prices - not everything needs to be the same cost!`,
    timestamp: new Date(),
  }]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);
  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, restaurant: Restaurant) => {
    e.dataTransfer.setData('application/json', JSON.stringify(restaurant));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (day: DayOfWeek, meal: MealTime, restaurant: Restaurant) => {
    const newPlan = { ...plan };
    newPlan[day] = { 
      ...newPlan[day], 
      [meal]: { restaurant, mealTime: meal } 
    };
    setPlan(newPlan);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✓ Added **${restaurant.name}** to **${DAY_LABELS[day].full} ${meal}**! (${restaurant.priceLevel} ~$${restaurant.estimatedCost})`,
      timestamp: new Date(),
    }]);
  };

  const handleRemove = (day: DayOfWeek, meal: MealTime) => {
    const newPlan = { ...plan };
    newPlan[day] = { ...newPlan[day], [meal]: null };
    setPlan(newPlan);
  };

  // ⭐ UPDATED: Added retry logic for 500 errors
  const handleSendMessage = async (content: string) => {
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content, 
      timestamp: new Date() 
    }]);
    setIsLoading(true);

    try {
      const fullQuery = buildFullQuery(content, preferences, filters);
      console.log('📤 Sending query:', fullQuery);
      
      let response;
      try {
        response = await searchRestaurants(fullQuery, filters.location, chatId);
      } catch (error: any) {
        // If 500 error, retry with minimal query
        if (error.message.includes('500')) {
          console.log('⚠️ Got 500 error, retrying with simpler query...');
          const simpleQuery = `${content} in ${filters.location}`;
          response = await searchRestaurants(simpleQuery, filters.location, chatId);
        } else {
          throw error;
        }
      }
      
      if (response.chat_id) setChatId(response.chat_id);
      
      // ⭐ UPDATED: Better business extraction from multiple possible locations
      let businesses: any[] = [];
      if (response.businesses && Array.isArray(response.businesses)) {
        businesses = response.businesses;
        console.log(`✅ Found ${businesses.length} businesses in response.businesses`);
      } else if (response.entities) {
        if (Array.isArray(response.entities)) {
          businesses = response.entities.flatMap((e: any) => e.businesses || []);
          console.log(`✅ Found ${businesses.length} businesses in response.entities (array)`);
        } else if (response.entities.businesses) {
          businesses = response.entities.businesses;
          console.log(`✅ Found ${businesses.length} businesses in response.entities.businesses`);
        }
      }

      console.log(`🎯 Extracted ${businesses.length} total businesses`);

      const restaurants = businesses.map(transformYelpBusiness);
      const aiText = response.response?.text || '';
      const lowerContent = content.toLowerCase();

      let assistantContent = '';
      let suggestedPlan: Partial<WeeklyPlanType> | undefined;

      // Check if planning a specific day
      const dayMatch = DAYS.find(d => lowerContent.includes(d));
      
      if (restaurants.length > 0) {
        if (dayMatch && lowerContent.includes('plan')) {
          // Plan a single day
          assistantContent = `Here's my suggestion for **${DAY_LABELS[dayMatch].full}**:\n\n`;
          suggestedPlan = { [dayMatch]: { breakfast: null, lunch: null, dinner: null } };
          
          const sortedByPrice = [...restaurants].sort((a, b) => a.estimatedCost - b.estimatedCost);
          const breakfast = sortedByPrice.find(r => r.estimatedCost <= 18) || sortedByPrice[0];
          const dinner = sortedByPrice.reverse().find(r => r.estimatedCost >= 20) || sortedByPrice[0];
          const lunch = sortedByPrice.find(r => r.id !== breakfast.id && r.id !== dinner.id) || sortedByPrice[1] || breakfast;
          
          const meals = [
            { meal: 'breakfast' as MealTime, r: breakfast, day: dayMatch },
            { meal: 'lunch' as MealTime, r: lunch, day: dayMatch },
            { meal: 'dinner' as MealTime, r: dinner, day: dayMatch }
          ];
          
          meals.forEach(({ meal, r, day }) => {
            if (r) {
              assistantContent += `${MEAL_ICONS[meal]} **${meal.charAt(0).toUpperCase() + meal.slice(1)}**: ${r.name}\n`;
              assistantContent += `   ${r.cuisine} • ${r.priceLevel} • ~${r.estimatedCost}\n\n`;
              (suggestedPlan![day] as any)[meal] = { restaurant: r, mealTime: meal };
            }
          });
          
          const dayTotal = meals.reduce((sum, { r }) => sum + (r?.estimatedCost || 0), 0);
          assistantContent += `💰 **Day Total: ~${dayTotal}**\n\nClick **Accept Plan** or drag individual restaurants!`;
          
        } else if (lowerContent.includes('plan') && lowerContent.includes('week')) {
          // Plan entire week (simplified - show diverse options)
          assistantContent = `Here are diverse options for your week:\n\n`;
          assistantContent += `**Budget-Friendly ($):**\n`;
          const cheap = restaurants.filter(r => r.estimatedCost <= 15).slice(0, 2);
          cheap.forEach(r => {
            assistantContent += `• ${r.name} - ${r.cuisine} (~$${r.estimatedCost})\n`;
          });
          
          assistantContent += `\n**Mid-Range ($$):**\n`;
          const mid = restaurants.filter(r => r.estimatedCost > 15 && r.estimatedCost <= 30).slice(0, 2);
          mid.forEach(r => {
            assistantContent += `• ${r.name} - ${r.cuisine} (~$${r.estimatedCost})\n`;
          });
          
          assistantContent += `\n**Splurge ($$$+):**\n`;
          const fancy = restaurants.filter(r => r.estimatedCost > 30).slice(0, 2);
          fancy.forEach(r => {
            assistantContent += `• ${r.name} - ${r.cuisine} (~$${r.estimatedCost})\n`;
          });
          
          assistantContent += `\n💡 Drag these to specific meal slots, or ask me to "Plan Monday" for a full day!`;
          
        } else {
          // Regular search
          assistantContent = aiText || `Found ${restaurants.length} options with varied prices:`;
          
          // Group by price for display
          const priceGroups = {
            budget: restaurants.filter(r => r.estimatedCost <= 15),
            moderate: restaurants.filter(r => r.estimatedCost > 15 && r.estimatedCost <= 30),
            upscale: restaurants.filter(r => r.estimatedCost > 30)
          };
          
          if (priceGroups.budget.length && priceGroups.upscale.length) {
            assistantContent += `\n\n💰 Mix of prices from $${Math.min(...restaurants.map(r => r.estimatedCost))} to $${Math.max(...restaurants.map(r => r.estimatedCost))}`;
          }
        }
      } else {
        assistantContent = aiText || `I couldn't find restaurants matching that. Try different criteria!`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        restaurants: restaurants.slice(0, 6),
        suggestedPlan,
        timestamp: new Date(),
      }]);

    } catch (error) {
      console.error('❌ Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I had trouble searching. The error was: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a simpler query!`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPlan = (suggestedPlan: Partial<WeeklyPlanType>) => {
    const newPlan = { ...plan };
    Object.keys(suggestedPlan).forEach(day => {
      const dayKey = day as DayOfWeek;
      const dayPlan = suggestedPlan[dayKey];
      if (dayPlan) {
        newPlan[dayKey] = { ...newPlan[dayKey], ...dayPlan };
      }
    });
    setPlan(newPlan);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎉 Added to your plan! Want me to plan another day, or find alternatives?`,
      timestamp: new Date(),
    }]);
  };

  const handleModifyPlan = () => handleSendMessage("Show me different options with varied prices");

  const handleResetConversation = () => {
    setChatId(undefined);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `Fresh start! 🔄 What meals can I help you plan in **${filters.location}**?`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl animate-pulse-soft delay-300"></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-pulse-soft delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 animate-fade-in-down">
          <button onClick={onBack} className="glass px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 hover-lift transition-all">
            ← Back to Settings
          </button>
          {chatId && (
            <button 
              onClick={handleResetConversation}
              className="glass-orange px-4 py-2 rounded-full text-orange-600 hover:text-orange-700 hover-lift transition-all flex items-center gap-2"
            >
              🔄 New Chat
            </button>
          )}
        </div>
        
        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sticky Sidebar */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-4 animate-fade-in-left">
              <WeeklyPlanDisplay 
                plan={plan} 
                budget={filters.budget} 
                onRemove={handleRemove}
                onDrop={handleDrop}
                onViewRestaurant={setViewingRestaurant}
                onFinish={onFinish} 
                hasPlan={hasPlan}
                preferences={preferences}
                filters={filters}
                onUpdatePreferences={setPreferences}
                onUpdateFilters={setFilters}
              />
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 min-h-[calc(100vh-120px)] animate-fade-in-right">
            <ChatAssistant
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading}
              onViewRestaurant={setViewingRestaurant} 
              onAcceptPlan={handleAcceptPlan}
              onModifyPlan={handleModifyPlan}
              onDragStart={handleDragStart} 
              preferences={preferences} 
              filters={filters}
              hasConversationContext={!!chatId}
            />
          </div>
        </div>
      </div>

      {/* Restaurant Modal */}
      {viewingRestaurant && (
        <RestaurantDetailModal
          restaurant={viewingRestaurant} 
          onClose={() => setViewingRestaurant(null)}
          onAddToDay={(day, meal) => handleDrop(day, meal, viewingRestaurant)}
          preferences={preferences} 
          filters={filters}
        />
      )}
    </div>
  );
}