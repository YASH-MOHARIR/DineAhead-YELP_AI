// components/ChatAssistant.tsx
import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { ChatMessage, Restaurant, UserPreferences, Filters, WeeklyPlanType } from '../types'; 
import RestaurantCard from './RestaurantCard';

interface ChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onViewRestaurant: (restaurant: Restaurant) => void;
  onAcceptPlan: (plan: Partial<WeeklyPlanType>) => void;
  onModifyPlan: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, restaurant: Restaurant) => void;
  preferences: UserPreferences;
  filters: Filters;
  hasConversationContext?: boolean;
}

const QUICK_PROMPTS = [
  { text: "Plan Monday's meals", icon: "📅" },
  { text: "Breakfast spots", icon: "🌅" },
  { text: "Fancy dinner", icon: "🌙" },
  { text: "Cheap lunch < $12", icon: "💰" }
];

const FOLLOW_UP_PROMPTS = [
  { text: "Show more options", icon: "➕" },
  { text: "Something cheaper", icon: "💵" },
  { text: "Different cuisine", icon: "🍽️" },
  { text: "Plan another day", icon: "📅" }
];

// ⭐ NEW: Simple markdown renderer
function renderMarkdown(text: string): JSX.Element {
  // Split by newlines and process each line
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, i) => {
        // Bold text **text**
        let processedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Bullet points • or -
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={i} className="flex gap-2 my-1">
              <span className="text-orange-500">•</span>
              <span dangerouslySetInnerHTML={{ __html: processedLine.replace(/^[•\-]\s*/, '') }} />
            </div>
          );
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        
        // Regular lines
        return (
          <div key={i} dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      })}
    </>
  );
}

export default function ChatAssistant({ 
  messages, onSendMessage, isLoading, onViewRestaurant, onAcceptPlan, onModifyPlan,
  onDragStart, preferences, filters, hasConversationContext = false
}: ChatAssistantProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const showFollowUps = hasConversationContext && messages.length > 2;
  const prompts = showFollowUps ? FOLLOW_UP_PROMPTS : QUICK_PROMPTS;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-rose-50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl animate-float">🤖</span> 
            <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              DineAhead Assistant
            </span>
          </h3>
          {hasConversationContext && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Plan breakfast, lunch & dinner • Drag restaurants to add them
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' 
                : 'bg-white shadow-md border border-gray-100'
            }`}>
              {/* ⭐ UPDATED: Render markdown */}
              <div className={`text-sm leading-relaxed ${
                msg.role === 'user' ? 'text-white' : 'text-gray-800'
              }`}>
                {renderMarkdown(msg.content)}
              </div>
              
              {/* Restaurant Cards */}
              {msg.restaurants && msg.restaurants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.restaurants.map((r, i) => (
                    <div key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
                      <RestaurantCard
                        restaurant={r}
                        size="full"
                        onClick={() => onViewRestaurant(r)}
                        onDragStart={(e) => onDragStart(e, r)}
                        preferences={preferences}
                        filters={filters}
                        showMatchScore={true}
                        draggable={true}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Plan Actions */}
              {msg.suggestedPlan && (
                <div className="mt-3 flex gap-2 animate-fade-in delay-200">
                  <button 
                    onClick={() => onAcceptPlan(msg.suggestedPlan!)}
                    className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold 
                               hover:bg-green-600 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>✓</span> Accept Plan
                  </button>
                  <button 
                    onClick={onModifyPlan}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium
                               hover:bg-gray-200 transition-all flex items-center gap-1.5"
                  >
                    <span>🔄</span> Different Options
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-400">Finding perfect restaurants...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {!isLoading && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt, i) => (
              <button 
                key={prompt.text}
                onClick={() => onSendMessage(prompt.text)}
                className="bg-white px-3 py-1.5 rounded-full text-xs text-gray-600 border border-gray-200
                           hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600
                           transition-all shadow-sm animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="mr-1">{prompt.icon}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about breakfast, lunch, dinner, or plan a day..."
            className="flex-1 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 
                       focus:border-orange-400 focus:bg-white focus:shadow-lg
                       focus:outline-none placeholder-gray-400 transition-all"
            disabled={isLoading} 
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-4 rounded-xl 
                       font-semibold hover:from-orange-600 hover:to-rose-600 
                       disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                       transition-all shadow-lg hover:shadow-xl"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}