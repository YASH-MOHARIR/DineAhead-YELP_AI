// components/RestaurantDetailModal.tsx
import { useState } from 'react';
import type { Restaurant, UserPreferences, Filters, DayOfWeek, MealTime } from '../types';
import { DAYS, MEAL_TIMES, DAY_LABELS, MEAL_ICONS } from '../constants';
import { getMatchIndicators, getMatchScore, groupReviewsByRating } from '../utils/matching';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onAddToDay: (day: DayOfWeek, meal: MealTime) => void;
  preferences: UserPreferences;
  filters: Filters;
}

export default function RestaurantDetailModal({ 
  restaurant, onClose, onAddToDay, preferences, filters 
}: RestaurantDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealTime | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const matchIndicators = getMatchIndicators(restaurant, preferences, filters);
  const matchScore = getMatchScore(restaurant, preferences, filters);

  const handleAdd = () => {
    if (selectedDay && selectedMeal) {
      onAddToDay(selectedDay, selectedMeal);
      onClose();
    }
  };

  // Suggest best meal time based on price
  const suggestedMeal: MealTime = 
    restaurant.estimatedCost <= 15 ? 'breakfast' :
    restaurant.estimatedCost <= 28 ? 'lunch' : 'dinner';

  const mealSuggestionReason = {
    breakfast: 'Great morning prices! Perfect for starting your day.',
    lunch: 'Perfect midday value with quick service.',
    dinner: 'Premium dining experience for a special evening.'
  };

  // Get review distribution
  const reviewGroups = groupReviewsByRating(restaurant.reviewSnippets);
  // ⭐ CHANGED: Show top 10 reviews, with option to show all
  const topReviews = restaurant.reviewSnippets.slice(0, 10);
  const displayReviews = showAllReviews ? restaurant.reviewSnippets : topReviews;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in" 
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col" 
          onClick={e => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-orange-200 to-rose-200 flex-shrink-0">
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name} 
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setLightboxImage(restaurant.imageUrl)}
              onError={(e) => { 
                const target = e.currentTarget;
                if (!target.dataset.fallbackAttempted) {
                  const cuisine = restaurant.cuisine.toLowerCase().replace(/\s+/g, '-');
                  target.src = `https://source.unsplash.com/800x400/?${cuisine},food,restaurant`;
                  target.dataset.fallbackAttempted = 'true';
                } else {
                  target.src = `https://picsum.photos/seed/${restaurant.id}/800/400`;
                }
              }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white w-9 h-9 rounded-full 
                         flex items-center justify-center hover:bg-black/60 transition-all z-10"
            >
              ✕
            </button>
            
            {/* Restaurant Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                {restaurant.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{restaurant.rating}</span>
                </span>
                <span>•</span>
                <span>{restaurant.reviewCount.toLocaleString()} reviews</span>
                <span>•</span>
                <span>{restaurant.cuisine}</span>
                <span>•</span>
                <span>{restaurant.priceLevel}</span>
              </div>
            </div>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg font-bold text-gray-800 text-sm">
                ~${restaurant.estimatedCost}
              </span>
              <span className={`px-3 py-1.5 rounded-full shadow-lg font-bold text-white text-sm ${
                matchScore >= 70 ? 'bg-green-500' : matchScore >= 40 ? 'bg-yellow-500' : 'bg-gray-500'
              }`}>
                {matchScore}% match
              </span>
              {restaurant.supportsReservation && (
                <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  📅 Reservations
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 sm:p-6">
              {/* Best For Badge */}
              <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl p-3 mb-4">
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">{MEAL_ICONS[suggestedMeal]} Best for {suggestedMeal}</span>
                  {' - '}{mealSuggestionReason[suggestedMeal]}
                </p>
              </div>

              {/* Match Indicators */}
              {matchIndicators.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {matchIndicators.slice(0, 5).map((ind, i) => (
                    <span 
                      key={i} 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        ind.matched 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {ind.icon} {ind.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm text-gray-800 font-medium">📍 {restaurant.address}</p>
                  <p className="text-xs text-gray-500 mt-1">{restaurant.distance} away</p>
                </div>
                {restaurant.phone && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Contact</p>
                    <p className="text-sm text-gray-800 font-medium">📞 {restaurant.phone}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
                {(['overview', 'reviews', 'photos'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 px-3 rounded-lg capitalize text-sm font-medium transition-all ${
                      activeTab === tab 
                        ? 'bg-white shadow-md text-gray-800' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Description */}
                    {(restaurant.summaries.long || restaurant.summaries.medium || restaurant.summaries.short || restaurant.contextualSummary) && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>ℹ️</span> About
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {restaurant.summaries.long || restaurant.summaries.medium || restaurant.summaries.short || restaurant.contextualSummary}
                        </p>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">{restaurant.rating}</p>
                        <p className="text-xs text-gray-600">Rating</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{restaurant.priceLevel}</p>
                        <p className="text-xs text-gray-600">Price</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{restaurant.distance}</p>
                        <p className="text-xs text-gray-600">Distance</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Rating Distribution */}
                    {reviewGroups && reviewGroups.length > 0 && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span>📊</span> Rating Distribution
                        </h3>
                        <div className="space-y-2">
                          {reviewGroups.map(g => (
                            <div key={g.rating} className="flex items-center gap-3">
                              <span className="text-sm w-8 font-medium text-gray-700">{g.rating}★</span>
                              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                                  style={{ width: `${g.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-12 text-right font-medium">{g.percentage}%</span>
                              <span className="text-xs text-gray-400 w-16 text-right">
                                ({g.reviews.length})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ⭐ ENHANCED: Amazon-Style Review Summary */}
                    {displayReviews.length > 0 && (
                      <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 border border-orange-100">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span>✨</span> What Customers Say
                        </h3>
                        {(() => {
                          // Separate reviews by rating
                          const positiveReviews = displayReviews.filter(r => r.rating && r.rating >= 4);
                          const negativeReviews = displayReviews.filter(r => r.rating && r.rating <= 2);
                          
                          const allText = displayReviews.map(r => r.text.toLowerCase()).join(' ');
                          const positiveText = positiveReviews.map(r => r.text.toLowerCase()).join(' ');
                          const negativeText = negativeReviews.map(r => r.text.toLowerCase()).join(' ');
                          
                          // Extract themes
                          const themes = {
                            food: {
                              positive: ['delicious', 'amazing food', 'tasty', 'flavorful', 'fresh', 'best food', 'excellent food', 'perfectly cooked', 'great food'],
                              negative: ['bland', 'overcooked', 'undercooked', 'dry', 'cold food', 'tasteless', 'not fresh', 'disappointing'],
                              items: ['burger', 'pizza', 'pasta', 'salad', 'sandwich', 'steak', 'chicken', 'fish', 'eggs', 'pancakes', 'tacos', 'sushi', 'fries', 'dessert']
                            },
                            service: {
                              positive: ['friendly', 'attentive', 'excellent service', 'helpful', 'great service', 'quick service', 'professional', 'welcoming'],
                              negative: ['slow service', 'rude', 'inattentive', 'poor service', 'waited long', 'ignored', 'unfriendly', 'slow']
                            },
                            atmosphere: {
                              positive: ['cozy', 'nice ambiance', 'clean', 'beautiful', 'comfortable', 'great atmosphere', 'inviting'],
                              negative: ['noisy', 'dirty', 'cramped', 'uncomfortable', 'too loud', 'crowded']
                            },
                            value: {
                              positive: ['worth it', 'good value', 'reasonable price', 'great price', 'affordable', 'fair price'],
                              negative: ['overpriced', 'expensive', 'not worth', 'too expensive', 'pricey', 'overpriced']
                            },
                            portions: {
                              positive: ['generous portions', 'large portions', 'filling', 'plenty of food', 'huge portions'],
                              negative: ['small portions', 'tiny', 'not enough food', 'still hungry', 'skimpy']
                            }
                          };
                          
                          // Find mentioned items
                          const mentionedDishes = themes.food.items.filter(item => allText.includes(item));
                          
                          // Analyze each theme
                          const analyzeTheme = (theme: any) => {
                            const posCount = theme.positive.filter((kw: string) => positiveText.includes(kw)).length;
                            const negCount = theme.negative.filter((kw: string) => negativeText.includes(kw)).length;
                            const posMentions = theme.positive.filter((kw: string) => positiveText.includes(kw));
                            const negMentions = theme.negative.filter((kw: string) => negativeText.includes(kw));
                            
                            return { posCount, negCount, posMentions, negMentions, total: posCount + negCount };
                          };
                          
                          const foodAnalysis = analyzeTheme(themes.food);
                          const serviceAnalysis = analyzeTheme(themes.service);
                          const atmosphereAnalysis = analyzeTheme(themes.atmosphere);
                          const valueAnalysis = analyzeTheme(themes.value);
                          const portionsAnalysis = analyzeTheme(themes.portions);
                          
                          // Build summary paragraphs
                          const paragraphs = [];
                          
                          // 1. Food quality paragraph
                          if (foodAnalysis.total > 0 || mentionedDishes.length > 0) {
                            let foodPara = '';
                            if (foodAnalysis.posCount > foodAnalysis.negCount * 2) {
                              foodPara = `Customers find the food to be ${foodAnalysis.posMentions.slice(0, 2).join(' and ')}`;
                            } else if (foodAnalysis.negCount > foodAnalysis.posCount * 2) {
                              foodPara = `Customers report concerns about the food quality, mentioning it's ${foodAnalysis.negMentions.slice(0, 2).join(' and ')}`;
                            } else if (foodAnalysis.posCount > 0 && foodAnalysis.negCount > 0) {
                              foodPara = `Food quality receives mixed feedback - while some find it ${foodAnalysis.posMentions[0] || 'good'}, others mention it can be ${foodAnalysis.negMentions[0] || 'inconsistent'}`;
                            } else if (mentionedDishes.length > 0) {
                              foodPara = 'Customers frequently mention the food';
                            }
                            
                            if (mentionedDishes.length > 0) {
                              const dishesInPositive = mentionedDishes.filter(d => positiveText.includes(d));
                              if (dishesInPositive.length > 0) {
                                foodPara += `, with ${dishesInPositive.slice(0, 3).join(', ')} being frequently recommended`;
                              } else {
                                foodPara += `, with customers ordering ${mentionedDishes.slice(0, 3).join(', ')}`;
                              }
                            }
                            
                            if (foodPara) paragraphs.push(foodPara + '.');
                          }
                          
                          // 2. Service paragraph
                          if (serviceAnalysis.total > 0) {
                            let servicePara = '';
                            if (serviceAnalysis.posCount > serviceAnalysis.negCount * 2) {
                              servicePara = `The service is praised as ${serviceAnalysis.posMentions.slice(0, 2).join(' and ')}.`;
                            } else if (serviceAnalysis.negCount > serviceAnalysis.posCount * 2) {
                              servicePara = `Service receives criticism for being ${serviceAnalysis.negMentions.slice(0, 2).join(' and ')}.`;
                            } else if (serviceAnalysis.posCount > 0 && serviceAnalysis.negCount > 0) {
                              servicePara = `Service quality is inconsistent - some customers report ${serviceAnalysis.posMentions[0] || 'good'} experiences while others mention ${serviceAnalysis.negMentions[0] || 'slow service'}.`;
                            }
                            if (servicePara) paragraphs.push(servicePara);
                          }
                          
                          // 3. Value + portions paragraph
                          let valuePara = '';
                          if (valueAnalysis.total > 0) {
                            if (valueAnalysis.posCount > valueAnalysis.negCount) {
                              valuePara = `Most customers find it ${valueAnalysis.posMentions[0] || 'good value for money'}`;
                            } else if (valueAnalysis.negCount > valueAnalysis.posCount) {
                              valuePara = `Value for money is questioned, with many finding it ${valueAnalysis.negMentions[0] || 'overpriced'}`;
                            } else {
                              valuePara = `Price opinions are divided, with some considering it ${valueAnalysis.posMentions[0] || 'reasonable'} while others say it's ${valueAnalysis.negMentions[0] || 'expensive'}`;
                            }
                          }
                          
                          if (portionsAnalysis.total > 0) {
                            if (portionsAnalysis.posCount > portionsAnalysis.negCount) {
                              valuePara += valuePara ? `. Portion sizes are generally considered ${portionsAnalysis.posMentions[0] || 'good'}` : `Portion sizes are generally considered ${portionsAnalysis.posMentions[0] || 'good'}`;
                            } else if (portionsAnalysis.negCount > 0) {
                              valuePara += valuePara ? `, though several customers note the portions are ${portionsAnalysis.negMentions[0] || 'small'}` : `Several customers note the portions are ${portionsAnalysis.negMentions[0] || 'small'}`;
                            }
                          }
                          
                          if (valuePara) paragraphs.push(valuePara + '.');
                          
                          // 4. Atmosphere paragraph
                          if (atmosphereAnalysis.total > 0) {
                            let atmospherePara = '';
                            if (atmosphereAnalysis.posCount > atmosphereAnalysis.negCount) {
                              atmospherePara = `The atmosphere is described as ${atmosphereAnalysis.posMentions.slice(0, 2).join(' and ')}.`;
                            } else if (atmosphereAnalysis.negCount > 0) {
                              atmospherePara = `Some customers find the atmosphere ${atmosphereAnalysis.negMentions[0] || 'lacking'}.`;
                            }
                            if (atmospherePara) paragraphs.push(atmospherePara);
                          }
                          
                          // Ensure at least 3 lines
                          if (paragraphs.length === 0) {
                            paragraphs.push(
                              `Customers have shared ${displayReviews.length} reviews about their experiences at this restaurant.`,
                              positiveReviews.length > negativeReviews.length 
                                ? 'Most reviews are positive, highlighting good food and service.' 
                                : 'Reviews are mixed, with varying experiences reported.',
                              'Check out individual reviews below for more details.'
                            );
                          }
                          
                          return (
                            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                              <p className="font-semibold text-gray-900 mb-2">
                                Customers say:
                              </p>
                              {paragraphs.map((para, idx) => (
                                <p key={idx}>{para}</p>
                              ))}
                            </div>
                          );
                        })()}
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <a 
                            href={restaurant.yelpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Read all {restaurant.reviewCount} reviews on Yelp →
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* ⭐ CHANGED: Top 10 Reviews with Full Text */}
                    {displayReviews.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <span>💬</span> Top {topReviews.length} Reviews
                          </h3>
                          {restaurant.reviewSnippets.length > 10 && (
                            <button
                              onClick={() => setShowAllReviews(!showAllReviews)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              {showAllReviews ? 'Show Less' : `Show All (${restaurant.reviewSnippets.length})`}
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {displayReviews.map((r, i) => (
                            <div key={i} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                              {r.rating !== null && (
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, idx) => (
                                    <span key={idx} className={`text-sm ${idx < r.rating! ? 'text-yellow-500' : 'text-gray-300'}`}>⭐</span>
                                  ))}
                                  <span className="text-xs text-gray-500 ml-2">{r.rating}/5</span>
                                </div>
                              )}
                              {/* ⭐ CHANGED: Show full review text, no truncation */}
                              <p className="text-sm text-gray-700 leading-relaxed">
                                "{r.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {displayReviews.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-2">💭</p>
                        <p className="text-gray-500">No reviews available</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* ⭐ CHANGED: Photos with Lightbox */}
                {activeTab === 'photos' && (
                  restaurant.photos.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {restaurant.photos.slice(0, 9).map((p, i) => (
                          <div 
                            key={i} 
                            className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                            onClick={() => setLightboxImage(p)}
                          >
                            <img 
                              src={p} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* ⭐ NEW: Link to see more photos on Yelp */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Showing {Math.min(9, restaurant.photos.length)} of {restaurant.photos.length} photos
                        </p>
                        <a 
                          href={restaurant.yelpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View all photos on Yelp →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-2">📷</p>
                      <p className="text-gray-500 mb-2">No photos available</p>
                      <a 
                        href={restaurant.yelpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View on Yelp →
                      </a>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Add to Plan Footer - Fixed */}
          <div className="p-4 sm:p-6 border-t bg-gradient-to-br from-gray-50 to-white flex-shrink-0">
            <p className="text-sm font-semibold text-gray-700 mb-3">Add to your meal plan:</p>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <select 
                value={selectedDay || ''} 
                onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
                className="p-3 bg-white rounded-xl border-2 border-gray-200 focus:border-orange-400 
                           focus:outline-none text-sm font-medium shadow-sm"
              >
                <option value="">Select day...</option>
                {DAYS.map(d => (
                  <option key={d} value={d}>{DAY_LABELS[d].full}</option>
                ))}
              </select>
              
              <select 
                value={selectedMeal || ''} 
                onChange={e => setSelectedMeal(e.target.value as MealTime)}
                className="p-3 bg-white rounded-xl border-2 border-gray-200 focus:border-orange-400 
                           focus:outline-none text-sm font-medium shadow-sm"
              >
                <option value="">Select meal...</option>
                {MEAL_TIMES.map(m => (
                  <option key={m} value={m}>{MEAL_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleAdd}
                disabled={!selectedDay || !selectedMeal}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3.5 rounded-xl 
                           font-semibold hover:from-orange-600 hover:to-rose-600 
                           disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                           transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                ✓ Add to Plan
              </button>
              <a 
                href={restaurant.yelpUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 
                           hover:bg-orange-50 transition-all flex items-center justify-center shadow-sm"
                title="View on Yelp"
              >
                🔗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ NEW: Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white w-12 h-12 rounded-full 
                       flex items-center justify-center hover:bg-white/30 transition-all text-2xl"
          >
            ✕
          </button>
          <img 
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}