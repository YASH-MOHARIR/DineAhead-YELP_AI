// components/Preferences.tsx
import type { UserPreferences } from '../types';
import { DIETARY_OPTIONS, ALLERGEN_OPTIONS, CUISINE_OPTIONS } from '../constants';
import { ArrowLeft, ArrowRight, Utensils, AlertTriangle, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PreferencesProps {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Preferences({ preferences, setPreferences, onNext, onBack }: PreferencesProps) {
  const toggleAllergen = (a: string) => {
    const updated = preferences.allergens.includes(a) 
      ? preferences.allergens.filter(x => x !== a) 
      : [...preferences.allergens, a];
    setPreferences({ ...preferences, allergens: updated });
  };

  const toggleCuisine = (cuisine: string, type: 'like' | 'dislike') => {
    if (type === 'like') {
      const inD = preferences.cuisineDislikes.includes(cuisine);
      const inL = preferences.cuisineLikes.includes(cuisine);
      setPreferences({ 
        ...preferences, 
        cuisineLikes: inL ? preferences.cuisineLikes.filter(c => c !== cuisine) : [...preferences.cuisineLikes, cuisine], 
        cuisineDislikes: inD ? preferences.cuisineDislikes.filter(c => c !== cuisine) : preferences.cuisineDislikes 
      });
    } else {
      const inL = preferences.cuisineLikes.includes(cuisine);
      const inD = preferences.cuisineDislikes.includes(cuisine);
      setPreferences({ 
        ...preferences, 
        cuisineDislikes: inD ? preferences.cuisineDislikes.filter(c => c !== cuisine) : [...preferences.cuisineDislikes, cuisine], 
        cuisineLikes: inL ? preferences.cuisineLikes.filter(c => c !== cuisine) : preferences.cuisineLikes 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-purple-100 p-6">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl animate-pulse-soft delay-300"></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-pulse-soft delay-500"></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <button 
          onClick={onBack} 
          className="glass px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 
                     hover-lift transition-all flex items-center gap-2 mb-4 animate-fade-in-down"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Preferences</h1>
          <p className="text-gray-600">Tell us about your dietary needs and taste</p>
        </div>

        {/* Dietary Preference */}
        <div className="glass rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-500" /> Dietary Preference
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DIETARY_OPTIONS.map(opt => (
              <button 
                key={opt.value} 
                onClick={() => setPreferences({ 
                  ...preferences, 
                  dietary: preferences.dietary === opt.value ? null : opt.value 
                })}
                className={`p-4 rounded-xl text-left transition-all hover-lift ${
                  preferences.dietary === opt.value 
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' 
                    : 'glass-dark hover:bg-white/50 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="font-medium text-sm">{opt.label.replace(/\s+\S+$/, '')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Allergens */}
        <div className="glass rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up delay-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" /> Allergens to Avoid
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map(a => (
              <button 
                key={a} 
                onClick={() => toggleAllergen(a)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover-lift ${
                  preferences.allergens.includes(a) 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'glass-dark text-gray-600 hover:bg-white/50'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          {preferences.allergens.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              Selected {preferences.allergens.length} allergen{preferences.allergens.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Cuisine Preferences */}
        <div className="glass rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up delay-200">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5 text-orange-500" /> Cuisine Preferences
          </h2>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            Tap once to like <ThumbsUp className="w-4 h-4 text-green-500" />, tap again to dislike <ThumbsDown className="w-4 h-4 text-red-500" />
          </p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(c => {
              const isL = preferences.cuisineLikes.includes(c);
              const isD = preferences.cuisineDislikes.includes(c);
              
              let className = 'px-4 py-2 rounded-full text-sm font-medium transition-all hover-lift flex items-center gap-1.5 ';
              if (isL) className += 'bg-green-500 text-white shadow-md';
              else if (isD) className += 'bg-red-500 text-white shadow-md';
              else className += 'glass-dark text-gray-600 hover:bg-white/50';
              
              return (
                <button 
                  key={c} 
                  onClick={() => toggleCuisine(c, isL ? 'dislike' : 'like')} 
                  className={className}
                >
                  {isL && <ThumbsUp className="w-3.5 h-3.5" />}
                  {isD && <ThumbsDown className="w-3.5 h-3.5" />}
                  {c}
                </button>
              );
            })}
          </div>
          {(preferences.cuisineLikes.length > 0 || preferences.cuisineDislikes.length > 0) && (
            <p className="text-xs text-gray-500 mt-3">
              {preferences.cuisineLikes.length} liked, {preferences.cuisineDislikes.length} disliked
            </p>
          )}
        </div>

        <button 
          onClick={onNext} 
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-xl 
                     font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg 
                     hover:shadow-xl hover-lift flex items-center justify-center gap-2 animate-fade-in-up delay-300"
        >
          Continue to Budget
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}