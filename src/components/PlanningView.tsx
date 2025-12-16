// components/PlanningView.tsx
import { useState, type DragEvent } from 'react';
import type { WeeklyPlanType, UserPreferences, Filters, ChatMessage, Restaurant, DayOfWeek } from '../types';
import { DAYS } from '../constants';
import { searchRestaurants, transformYelpBusiness } from '../utils/api';
import { getMatchScore } from '../utils/matching';
import ChatAssistant from './ChatAssistant';
import WeeklyPlanDisplay from './WeeklyPlanDisplay';
import RestaurantDetailModal from './RestaurantDetailModal';

interface PlanningViewProps {
  plan: WeeklyPlanType;
  setPlan: (p: WeeklyPlanType) => void;
  preferences: UserPreferences;
  filters: Filters;
  onBack: () => void;
  onFinish: () => void;
  hasPlan: boolean;
}

function buildPreferenceContext(preferences: UserPreferences, filters: Filters): string {
  const parts: string[] = [];
  parts.push(`Location: ${filters.location}`);
  const budgetPerMeal = Math.round(filters.budget / 5);
  parts.push(`Budget: under $${budgetPerMeal} per meal`);
  parts.push(`Within ${filters.distance} miles`);
  if (preferences.dietary) parts.push(`Dietary: ${preferences.dietary} only`);
  if (preferences.allergens.length > 0) parts.push(`Must avoid: ${preferences.allergens.join(', ')}`);
  if (preferences.cuisineLikes.length > 0) parts.push(`Preferred cuisines: ${preferences.cuisineLikes.join(', ')}`);
  if (preferences.cuisineDislikes.length > 0) parts.push(`Avoid cuisines: ${preferences.cuisineDislikes.join(', ')}`);
  return parts.join('. ') + '.';
}

function buildFullQuery(userMessage: string, preferences: UserPreferences, filters: Filters): string {
  const context = buildPreferenceContext(preferences, filters);
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('plan') && (lowerMessage.includes('week') || lowerMessage.includes('whole'))) {
    return `Find 5 different restaurants for a weekly meal plan (Monday to Friday). I need variety - different cuisines each day. ${context} Give me diverse options that fit my preferences.`;
  }
  if (lowerMessage.includes('more') || lowerMessage.includes('alternative') || lowerMessage.includes('other') || lowerMessage.includes('different')) {
    return `Show me different restaurant options. ${context} ${userMessage}`;
  }
  if (lowerMessage.includes('cheap') || lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
    const lowerBudget = Math.round(filters.budget / 7);
    return `Find affordable restaurants under $${lowerBudget} per meal in ${filters.location}. ${preferences.dietary ? `${preferences.dietary} options.` : ''} ${userMessage}`;
  }
  if (lowerMessage.includes('health')) {
    return `Find healthy restaurants with nutritious options. ${context} Focus on fresh, healthy food. ${userMessage}`;
  }
  if (lowerMessage.includes('spic')) {
    return `Find restaurants with spicy food options in ${filters.location}. ${preferences.dietary ? `${preferences.dietary} friendly.` : ''} Budget under $${Math.round(filters.budget / 5)} per meal. ${userMessage}`;
  }
  if (lowerMessage.includes('surprise') || lowerMessage.includes('random')) {
    return `Recommend a unique, highly-rated restaurant I might not have tried. ${context} Something special and interesting.`;
  }
  const cuisines = ['italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai', 'korean', 'vietnamese', 'mediterranean', 'greek', 'french', 'american'];
  for (const cuisine of cuisines) {
    if (lowerMessage.includes(cuisine)) return `Find the best ${cuisine} restaurants. ${context}`;
  }
  return `${userMessage}. ${context}`;
}

export default function PlanningView({ plan, setPlan, preferences, filters, onBack, onFinish, hasPlan }: PlanningViewProps) {
  const budgetPerMeal = Math.round(filters.budget / 5);
  
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1', 
    role: 'assistant',
    content: `Hi! I'm your DineAhead assistant 🍽️\n\nI'll help you find restaurants in **${filters.location}** within your **$${budgetPerMeal}/meal** budget.${preferences.dietary ? `\n✓ Focusing on **${preferences.dietary}** options` : ''}${preferences.cuisineLikes.length > 0 ? `\n✓ You like: ${preferences.cuisineLikes.join(', ')}` : ''}${preferences.allergens.length > 0 ? `\n✓ Avoiding: ${preferences.allergens.join(', ')}` : ''}\n\n**Try asking:**\n• "Plan my whole week"\n• "Find Italian restaurants"\n• "Something spicy and cheap"\n\n💬 I remember our conversation - ask follow-ups anytime!`,
    timestamp: new Date(),
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);
  const [dragOverDay, setDragOverDay] = useState<DayOfWeek | null>(null);
  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, restaurant: Restaurant) => {
    e.dataTransfer.setData('application/json', JSON.stringify(restaurant));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (day: DayOfWeek, restaurant: Restaurant) => {
    setPlan({ ...plan, [day]: { restaurant, dishes: [] } });
    setMessages(prev => [...prev, {
      id: Date.now().toString(), 
      role: 'assistant',
      content: `✓ Added **${restaurant.name}** to **${day.charAt(0).toUpperCase() + day.slice(1)}**!`,
      timestamp: new Date(),
    }]);
  };

  const handleSendMessage = async (content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const fullQuery = buildFullQuery(content, preferences, filters);
      const response = await searchRestaurants(fullQuery, filters.location, chatId);
      
      if (response.chat_id) setChatId(response.chat_id);
      
      let businesses: any[] = [];
      if (response.entities) {
        if (Array.isArray(response.entities)) {
          businesses = response.entities.flatMap((e: any) => e.businesses || []);
        } else if (response.entities.businesses) {
          businesses = response.entities.businesses;
        }
      }

      const restaurants = businesses.map(transformYelpBusiness);
      const aiText = response.response?.text || '';
      const lowerContent = content.toLowerCase();

      let assistantContent = '';
      let suggestedPlan: Partial<WeeklyPlanType> | undefined;

      if (restaurants.length > 0) {
        if (lowerContent.includes('plan') && (lowerContent.includes('week') || lowerContent.includes('whole'))) {
          assistantContent = `Here's your personalized meal plan for **${filters.location}**:\n\n`;
          suggestedPlan = {};
          restaurants.slice(0, 5).forEach((r, i) => {
            const day = DAYS[i];
            const score = getMatchScore(r, preferences, filters);
            assistantContent += `**${day.charAt(0).toUpperCase() + day.slice(1)}**: ${r.name}\n   ${r.cuisine} • ${r.priceLevel} (~$${r.estimatedCost}) • ${score}% match\n\n`;
            (suggestedPlan as any)[day] = { restaurant: r, dishes: [] };
          });
          const totalCost = restaurants.slice(0, 5).reduce((sum, r) => sum + r.estimatedCost, 0);
          assistantContent += `💰 **Estimated Total: $${totalCost}** ${totalCost <= filters.budget ? '✓ Within budget!' : '⚠️ Over budget'}`;
          assistantContent += `\n\nClick **Accept Plan** or **Show Alternatives**!`;
        } else {
          assistantContent = aiText || `Found ${restaurants.length} option${restaurants.length > 1 ? 's' : ''} in ${filters.location}:`;
        }
      } else {
        assistantContent = aiText || `I couldn't find restaurants matching that in ${filters.location}. Try different criteria!`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: assistantContent,
        restaurants: restaurants.slice(0, 5), 
        suggestedPlan, 
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), 
        role: 'assistant',
        content: `Sorry, I had trouble searching. Please try again!`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPlan = (suggestedPlan: Partial<WeeklyPlanType>) => {
    setPlan({ ...plan, ...suggestedPlan } as WeeklyPlanType);
    setMessages(prev => [...prev, {
      id: Date.now().toString(), 
      role: 'assistant',
      content: `🎉 Plan accepted! All restaurants added.\n\nWant changes? Ask "swap Tuesday" or "find cheaper options"!`,
      timestamp: new Date(),
    }]);
  };

  const handleModifyPlan = () => handleSendMessage("Show me different restaurant alternatives");
  const handleRemove = (day: DayOfWeek) => setPlan({ ...plan, [day]: null });
  
  const handleResetConversation = () => {
    setChatId(undefined);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `Fresh start! 🔄 What are you in the mood for in **${filters.location}**?`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 p-4">
      {/* Animated background blobs */}
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
        
        {/* Main Layout - Sidebar sticky */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sticky Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-4 animate-fade-in-left">
              <WeeklyPlanDisplay 
                plan={plan} 
                budget={filters.budget} 
                onRemove={handleRemove}
                onDrop={handleDrop}
                onViewRestaurant={setViewingRestaurant}
                dragOverDay={dragOverDay} 
                setDragOverDay={setDragOverDay}
                onFinish={onFinish} 
                hasPlan={hasPlan}
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
          onAddToDay={(day) => {
            setPlan({ ...plan, [day]: { restaurant: viewingRestaurant, dishes: [] } });
            setMessages(prev => [...prev, {
              id: Date.now().toString(), 
              role: 'assistant',
              content: `✓ Added **${viewingRestaurant.name}** to **${day.charAt(0).toUpperCase() + day.slice(1)}**!`,
              timestamp: new Date(),
            }]);
          }}
          preferences={preferences} 
          filters={filters}
        />
      )}
    </div>
  );
}