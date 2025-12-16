// components/PlanSummary.tsx
import { useState } from 'react';
import type { WeeklyPlanType, Filters, DayOfWeek, Restaurant } from '../types';
import { DAYS, DAY_OFFSETS } from '../constants';
import { getNextMonday, downloadCalendar } from '../utils/calendar';
import RestaurantCard from './RestaurantCard';
import { 
  ArrowLeft, 
  PartyPopper, 
  ClipboardList, 
  UtensilsCrossed,
  MapPin,
  Save,
  Copy,
  Share2,
  Image,
  Calendar,
  CalendarPlus,
  ExternalLink,
  Phone,
  X,
  Check
} from 'lucide-react';

interface PlanSummaryProps {
  plan: WeeklyPlanType;
  filters: Filters;
  onBack: () => void;
  onEdit: () => void;
  onSave: (name: string) => void;
  onViewRestaurant: (restaurant: Restaurant) => void;
}

export default function PlanSummary({ plan, filters, onBack, onEdit, onSave, onViewRestaurant }: PlanSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [planName, setPlanName] = useState('');
  const [saved, setSaved] = useState(false);
  const [selectedWeek] = useState<Date>(getNextMonday());
  
  const filledDays = DAYS.filter(d => plan[d]);
  const totalCost = DAYS.reduce((sum, d) => sum + (plan[d]?.restaurant.estimatedCost || 0), 0);
  const isComplete = filledDays.length === 5;
  const reservableRestaurants = DAYS.filter(d => plan[d]?.restaurant.supportsReservation);
  const hasReservable = reservableRestaurants.length > 0;

  const generatePlanText = (): string => {
    let text = `🍽️ My DineAhead Meal Plan\n`;
    text += `📍 ${filters.location} | 💰 Budget: $${filters.budget}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    DAYS.forEach(day => {
      const dayPlan = plan[day];
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      if (dayPlan) {
        text += `${dayName}: ${dayPlan.restaurant.name}\n`;
        text += `   ${dayPlan.restaurant.cuisine} • ${dayPlan.restaurant.priceLevel} • $${dayPlan.restaurant.estimatedCost}\n`;
        text += `   📍 ${dayPlan.restaurant.address}\n\n`;
      } else {
        text += `${dayName}: Not planned\n\n`;
      }
    });
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Total: $${totalCost} / $${filters.budget} budget\n`;
    text += `\nCreated with DineAhead 🍽️`;
    return text;
  };

  const copyToClipboard = async () => {
    const text = generatePlanText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    try {
      const planData = {
        p: DAYS.map(d => plan[d] ? { 
          n: plan[d]!.restaurant.name, 
          c: plan[d]!.restaurant.cuisine, 
          $: plan[d]!.restaurant.estimatedCost 
        } : null),
        l: filters.location,
        b: filters.budget
      };
      const encoded = btoa(JSON.stringify(planData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?plan=${encoded}`;
      
      if (navigator.share) {
        await navigator.share({ 
          title: 'My DineAhead Meal Plan', 
          text: 'Check out my meal plan for the week!', 
          url: shareUrl 
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setSharing(true);
        setTimeout(() => setSharing(false), 2000);
      }
    } catch (err) {
      // Fallback handled silently
    }
  };

  const downloadAsImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#fff7ed');
    gradient.addColorStop(1, '#fef2f2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#f97316');
    headerGradient.addColorStop(1, '#e11d48');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, canvas.width, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui';
    ctx.fillText('🍽️ DineAhead Meal Plan', 30, 50);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px system-ui';
    ctx.fillText(`📍 ${filters.location}  •  💰 $${totalCost} / $${filters.budget} budget`, 30, 115);
    
    let y = 160;
    DAYS.forEach((day, i) => {
      const dayPlan = plan[day];
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f9fafb';
      ctx.fillRect(20, y - 25, canvas.width - 40, 70);
      
      ctx.fillStyle = dayPlan ? '#f97316' : '#9ca3af';
      ctx.font = 'bold 18px system-ui';
      ctx.fillText(dayName, 40, y);
      
      if (dayPlan) {
        ctx.fillStyle = '#111827';
        ctx.font = '16px system-ui';
        ctx.fillText(dayPlan.restaurant.name, 140, y);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px system-ui';
        ctx.fillText(`${dayPlan.restaurant.cuisine} • ${dayPlan.restaurant.priceLevel} • $${dayPlan.restaurant.estimatedCost}`, 140, y + 22);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.font = 'italic 16px system-ui';
        ctx.fillText('Not planned', 140, y);
      }
      
      y += 80;
    });
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px system-ui';
    ctx.fillText('Created with DineAhead • dineahead.app', 30, canvas.height - 20);
    
    const link = document.createElement('a');
    link.download = 'dineahead-meal-plan.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSavePlan = () => {
    const name = planName.trim() || `Plan ${new Date().toLocaleDateString()}`;
    onSave(name);
    setSaved(true);
    setShowSaveDialog(false);
    setPlanName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 p-6">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <button onClick={onBack} className="glass px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 mb-4 hover-lift transition-all flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            {isComplete ? <PartyPopper className="w-8 h-8 text-orange-500" /> : <ClipboardList className="w-8 h-8 text-orange-500" />}
            {isComplete ? 'Your Plan is Ready!' : 'Your Meal Plan'}
          </h1>
          <p className="text-gray-600">
            {isComplete ? 'Share it, save it, or make reservations' : `${filledDays.length}/5 days planned`}
          </p>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-fade-in-up">
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-6 text-white">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" /> Weekly Meal Plan
            </h2>
            <p className="opacity-90 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {filters.location}
            </p>
          </div>
          
          <div className="divide-y">
            {DAYS.map((day, i) => {
              const dayPlan = plan[day];
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              return (
                <div 
                  key={day} 
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-20 font-semibold ${dayPlan ? 'text-orange-600' : 'text-gray-400'}`}>
                    {dayName}
                  </div>
                  {dayPlan ? (
                    <RestaurantCard
                      restaurant={dayPlan.restaurant}
                      size="compact"
                      onClick={() => onViewRestaurant(dayPlan.restaurant)}
                      className="flex-1"
                    />
                  ) : (
                    <div className="flex-1 text-gray-400 italic">Not planned</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center">
            <span className="font-medium text-gray-700">Estimated Total</span>
            <div className="text-right">
              <span className={`text-2xl font-bold ${totalCost <= filters.budget ? 'text-green-600' : 'text-red-500'}`}>
                ${totalCost}
              </span>
              <span className="text-gray-400 ml-2">/ ${filters.budget}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in-up delay-200">
          <button 
            onClick={() => setShowSaveDialog(true)} 
            disabled={saved}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex items-center justify-center gap-2 
                       disabled:opacity-50 hover:-translate-y-0.5"
          >
            {saved ? <Check className="w-5 h-5 text-green-500" /> : <Save className="w-5 h-5 text-orange-500" />}
            <span className="font-medium text-gray-700">{saved ? 'Saved!' : 'Save Plan'}</span>
          </button>
          
          <button 
            onClick={copyToClipboard}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-orange-500" />}
            <span className="font-medium text-gray-700">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button 
            onClick={shareLink}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            {sharing ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5 text-orange-500" />}
            <span className="font-medium text-gray-700">{sharing ? 'Link Copied!' : 'Share Link'}</span>
          </button>
          
          <button 
            onClick={downloadAsImage}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl border-2 border-transparent
                       hover:border-orange-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Image className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-gray-700">Download</span>
          </button>
        </div>

        {/* Calendar & Reservations */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-300">
          <button 
            onClick={() => downloadCalendar(plan, selectedWeek)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl shadow-lg 
                       hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <CalendarPlus className="w-5 h-5" />
            <span className="font-medium">Add to Calendar</span>
          </button>
          
          {hasReservable && (
            <button 
              onClick={() => setShowReservations(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg 
                         hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Book Tables</span>
            </button>
          )}
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
               onClick={() => setShowSaveDialog(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in" 
                 onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Save className="w-5 h-5 text-orange-500" /> Save Plan
              </h2>
              <input 
                type="text" 
                placeholder="Plan name (optional)" 
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-orange-400 focus:outline-none"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePlan}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl 
                             font-medium hover:from-orange-600 hover:to-rose-600 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Modal */}
        {showReservations && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
               onClick={() => setShowReservations(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl animate-scale-in" 
                 onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-rose-500 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5" /> Make Reservations
                  </h2>
                  <p className="text-sm opacity-90">Book tables at your selected restaurants</p>
                </div>
                <button onClick={() => setShowReservations(false)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-96 p-4 space-y-3">
                {DAYS.map(day => {
                  const dayPlan = plan[day];
                  if (!dayPlan) return null;
                  
                  const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                  const eventDate = new Date(selectedWeek);
                  eventDate.setDate(selectedWeek.getDate() + DAY_OFFSETS[day]);
                  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <div key={day} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={dayPlan.restaurant.imageUrl} 
                          alt="" 
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${dayPlan.restaurant.id}/100/100`; }} 
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{dayPlan.restaurant.name}</p>
                          <p className="text-sm text-gray-500">{dayName} • {dateStr}</p>
                        </div>
                      </div>
                      
                      {dayPlan.restaurant.supportsReservation ? (
                        <a 
                          href={dayPlan.restaurant.reservationUrl || dayPlan.restaurant.yelpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-green-500 text-white rounded-lg font-medium 
                                     hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" /> Book on Yelp
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <a 
                          href={`tel:${dayPlan.restaurant.phone}`}
                          className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium 
                                     hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                          <Phone className="w-4 h-4" /> Call to Reserve
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}