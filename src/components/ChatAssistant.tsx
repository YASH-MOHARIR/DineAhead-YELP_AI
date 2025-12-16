// components/ChatAssistant.tsx
import { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import type { ChatMessage, Restaurant, UserPreferences, Filters, WeeklyPlanType } from '../types'; 
import RestaurantCard from './RestaurantCard';
import { 
  Bot, 
  Calendar, 
  Flame, 
  Leaf, 
  Sparkles, 
  Plus, 
  DollarSign, 
  UtensilsCrossed, 
  MapPin,
  Check,
  RefreshCw,
  Send,
  Lightbulb
} from 'lucide-react';

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
  { text: "Plan my whole week", icon: Calendar },
  { text: "Find something spicy", icon: Flame },
  { text: "Healthy options", icon: Leaf },
  { text: "Surprise me!", icon: Sparkles }
];

const FOLLOW_UP_PROMPTS = [
  { text: "Show me more", icon: Plus },
  { text: "Something cheaper", icon: DollarSign },
  { text: "Different cuisine", icon: UtensilsCrossed },
  { text: "Closer to me", icon: MapPin }
];

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
    <div className="flex flex-col h-full glass rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-white/50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center animate-float">
              <Bot className="w-5 h-5 text-orange-500" />
            </div>
            <span className="gradient-text">DineAhead Assistant</span>
          </h3>
          {hasConversationContext && (
            <span className="glass-orange px-3 py-1 rounded-full text-xs text-orange-600 flex items-center gap-1.5 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {hasConversationContext 
            ? "I remember our chat — ask follow-ups anytime!" 
            : "Drag restaurants to your plan or click to view details"}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all hover-scale ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white' 
                : 'glass border border-white/30'
            }`}>
              <p className={`text-sm whitespace-pre-wrap ${
                msg.role === 'user' ? 'text-white' : 'text-gray-800'
              }`}>
                {msg.content}
              </p>
              
              {/* Restaurant Cards */}
              {msg.restaurants && msg.restaurants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.restaurants.map((r, i) => (
                    <div 
                      key={r.id} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <RestaurantCard
                        restaurant={r}
                        size="full"
                        onClick={() => onViewRestaurant(r)}
                        onDragStart={onDragStart}
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
                <div className="mt-3 flex gap-2 animate-fade-in delay-300">
                  <button 
                    onClick={() => onAcceptPlan(msg.suggestedPlan!)}
                    className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium 
                               hover:bg-green-600 transition-all hover-lift flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" /> Accept Plan
                  </button>
                  <button 
                    onClick={onModifyPlan}
                    className="glass px-4 py-2 rounded-xl text-sm font-medium text-gray-700
                               hover:bg-white/80 transition-all hover-lift flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Show Alternatives
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-xs text-gray-400">Finding restaurants...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {!isLoading && (
        <div className="px-4 pb-2 animate-fade-in">
          <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1.5">
            {showFollowUps ? (
              <><Sparkles className="w-3 h-3" /> Refine your search:</>
            ) : (
              <><Lightbulb className="w-3 h-3" /> Try asking:</>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt, i) => (
              <button 
                key={prompt.text}
                onClick={() => onSendMessage(prompt.text)}
                className="glass px-3 py-1.5 rounded-full text-xs text-gray-600 
                           hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200
                           transition-all hover-scale animate-fade-in-up flex items-center gap-1.5"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <prompt.icon className="w-3.5 h-3.5" />
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasConversationContext 
              ? "Ask a follow-up..." 
              : "What are you in the mood for?"}
            className="flex-1 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 
                       focus:border-orange-400 focus:bg-white focus:shadow-[0_0_20px_rgba(249,115,22,0.15)]
                       focus:outline-none placeholder-gray-400 transition-all text-gray-800"
            disabled={isLoading} 
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-4 rounded-xl 
                       font-semibold hover:from-orange-600 hover:to-rose-600 
                       disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                       transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:shadow-none
                       flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}